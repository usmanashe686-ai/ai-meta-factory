package main

import (
    "context"
    "encoding/json"
    "io"
    "log"
    "net/http"
    "os"
    "path/filepath"
    "time"

    "github.com/docker/docker/api/types"
    "github.com/docker/docker/api/types/container"
    "github.com/docker/docker/client"
    "github.com/docker/docker/pkg/archive"
    "github.com/go-redis/redis/v8"
)

type BuildRequest struct {
    ProjectID string            `json:"project_id"`
    Platform  string            `json:"platform"`
    Files     map[string]string `json:"files"`
}

type BuildResponse struct {
    BuildID string `json:"build_id"`
    Status  string `json:"status"`
}

var redisClient *QueueClient
var dockerClient *client.Client

func init() {
    // Connect to Redis
    redisAddr := os.Getenv("REDIS_ADDR")
    if redisAddr == "" {
        redisAddr = "localhost:6379"
    }
    redisClient = NewQueueClient(redisAddr, "", 0)

    // Connect to Docker (using environment or default socket)
    var err error
    dockerClient, err = client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
    if err != nil {
        log.Fatalf("Failed to create Docker client: %v", err)
    }
}

func main() {
    // Start worker goroutine
    go worker()

    http.HandleFunc("/health", healthHandler)
    http.HandleFunc("/build", buildHandler)          // generic build endpoint
    http.HandleFunc("/build/status", statusHandler)  // get build status

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }
    log.Printf("Build service listening on port %s", port)
    log.Fatal(http.ListenAndServe(":"+port, nil))
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func buildHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    var req BuildRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }

    // Generate build ID
    buildID := time.Now().Format("20060102-150405") + "-" + req.ProjectID

    // Create build job
    job := &BuildJob{
        BuildID:   buildID,
        ProjectID: req.ProjectID,
        Platform:  req.Platform,
        Files:     req.Files,
        Status:    "queued",
        CreatedAt: time.Now(),
    }

    // Push to Redis queue
    if err := redisClient.PushBuild(job); err != nil {
        log.Printf("Failed to push build to queue: %v", err)
        http.Error(w, "Failed to queue build", http.StatusInternalServerError)
        return
    }

    // Store initial status
    redisClient.UpdateBuildStatus(buildID, "queued", "")

    resp := BuildResponse{
        BuildID: buildID,
        Status:  "queued",
    }
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusAccepted)
    json.NewEncoder(w).Encode(resp)
}

func statusHandler(w http.ResponseWriter, r *http.Request) {
    buildID := r.URL.Query().Get("id")
    if buildID == "" {
        http.Error(w, "Missing build id", http.StatusBadRequest)
        return
    }
    status, err := redisClient.GetBuildStatus(buildID)
    if err != nil {
        http.Error(w, "Build not found", http.StatusNotFound)
        return
    }
    json.NewEncoder(w).Encode(status)
}

// worker continuously processes build jobs from the queue
func worker() {
    for {
        job, err := redisClient.PopBuild()
        if err != nil {
            log.Printf("Worker error: %v", err)
            time.Sleep(5 * time.Second)
            continue
        }
        log.Printf("Processing build %s for platform %s", job.BuildID, job.Platform)
        redisClient.UpdateBuildStatus(job.BuildID, "building", "")

        // Run the build in Docker
        downloadURL, err := runBuildInDocker(job)
        if err != nil {
            log.Printf("Build failed: %v", err)
            redisClient.UpdateBuildStatus(job.BuildID, "failed", "")
        } else {
            redisClient.UpdateBuildStatus(job.BuildID, "completed", downloadURL)
        }
    }
}

// runBuildInDocker creates a container with the project files and runs the build
func runBuildInDocker(job *BuildJob) (string, error) {
    ctx := context.Background()

    // Create a temporary directory for the project
    tmpDir, err := os.MkdirTemp("", "build-"+job.BuildID)
    if err != nil {
        return "", err
    }
    defer os.RemoveAll(tmpDir)

    // Write files
    for path, content := range job.Files {
        fullPath := filepath.Join(tmpDir, path)
        if err := os.MkdirAll(filepath.Dir(fullPath), 0755); err != nil {
            return "", err
        }
        if err := os.WriteFile(fullPath, []byte(content), 0644); err != nil {
            return "", err
        }
    }

    // Determine Docker image based on platform
    var image string
    var cmd []string
    switch job.Platform {
    case "flutter":
        image = "cirrusci/flutter:stable"
        cmd = []string{"flutter", "build", "apk", "--release"}
    case "react-native":
        image = "reactnativecommunity/react-native-android:latest" // example
        cmd = []string{"sh", "-c", "cd android && ./gradlew assembleRelease"}
    default:
        return "", nil // unsupported
    }

    // Create a tar of the project directory for Docker
    tar, err := archive.TarWithOptions(tmpDir, &archive.TarOptions{})
    if err != nil {
        return "", err
    }

    // Create container
    resp, err := dockerClient.ContainerCreate(ctx, &container.Config{
        Image: image,
        Cmd:   cmd,
        Tty:   false,
    }, &container.HostConfig{
        AutoRemove: true,
    }, nil, nil, "")
    if err != nil {
        return "", err
    }

    // Copy project files into container
    err = dockerClient.CopyToContainer(ctx, resp.ID, "/app", tar, types.CopyToContainerOptions{})
    if err != nil {
        return "", err
    }

    // Start container
    if err := dockerClient.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{}); err != nil {
        return "", err
    }

    // Wait for container to finish
    statusCh, errCh := dockerClient.ContainerWait(ctx, resp.ID, container.WaitConditionNotRunning)
    select {
    case err := <-errCh:
        if err != nil {
            return "", err
        }
    case <-statusCh:
    }

    // Get logs (for debugging)
    logs, _ := dockerClient.ContainerLogs(ctx, resp.ID, types.ContainerLogsOptions{ShowStdout: true, ShowStderr: true})
    defer logs.Close()
    // Optionally store logs somewhere

    // In a real system, you'd copy the built artifact out of the container
    // For now, we just return a placeholder
    downloadURL := "http://example.com/builds/" + job.BuildID + "/app.apk"
    return downloadURL, nil
}

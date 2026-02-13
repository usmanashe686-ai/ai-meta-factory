package main

import (
    "encoding/json"
    "log"
    "net/http"
    "os"
    "os/exec"
    "path/filepath"
    "time"
)

type BuildRequest struct {
    ProjectID string `json:"project_id"`
    Platform  string `json:"platform"` // "flutter", "react-native", etc.
    Files     map[string]string `json:"files"` // file path -> content
}

type BuildResponse struct {
    BuildID    string `json:"build_id"`
    Status     string `json:"status"`
    DownloadURL string `json:"download_url,omitempty"`
    Error      string `json:"error,omitempty"`
}

var buildsDir = "./builds"

func init() {
    // Ensure builds directory exists
    os.MkdirAll(buildsDir, 0755)
}

func main() {
    http.HandleFunc("/health", healthHandler)
    http.HandleFunc("/build/flutter", flutterBuildHandler)

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

func flutterBuildHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    var req BuildRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    // Generate a unique build ID
    buildID := time.Now().Format("20060102-150405") + "-" + req.ProjectID

    // Create a temporary directory for the project
    tmpDir := filepath.Join(buildsDir, buildID)
    if err := os.MkdirAll(tmpDir, 0755); err != nil {
        http.Error(w, "Failed to create build directory", http.StatusInternalServerError)
        return
    }

    // Write files to the temporary directory
    for path, content := range req.Files {
        fullPath := filepath.Join(tmpDir, path)
        dir := filepath.Dir(fullPath)
        if err := os.MkdirAll(dir, 0755); err != nil {
            http.Error(w, "Failed to create directories", http.StatusInternalServerError)
            return
        }
        if err := os.WriteFile(fullPath, []byte(content), 0644); err != nil {
            http.Error(w, "Failed to write file", http.StatusInternalServerError)
            return
        }
    }

    // Trigger build asynchronously (in real impl, use goroutine and update status somewhere)
    go buildFlutterProject(tmpDir, buildID)

    // Respond immediately with build ID
    resp := BuildResponse{
        BuildID: buildID,
        Status:  "queued",
    }
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusAccepted)
    json.NewEncoder(w).Encode(resp)
}

func buildFlutterProject(projectDir, buildID string) {
    log.Printf("Building Flutter project %s in %s", buildID, projectDir)

    // Simulate build process: run flutter build apk
    // In production, you'd need Flutter SDK installed and path set
    cmd := exec.Command("flutter", "build", "apk", "--release")
    cmd.Dir = projectDir
    output, err := cmd.CombinedOutput()

    if err != nil {
        log.Printf("Build failed for %s: %v\nOutput: %s", buildID, err, output)
        // Here you'd update a database or notify via webhook
        return
    }

    log.Printf("Build succeeded for %s", buildID)

    // The APK is usually at build/app/outputs/flutter-apk/app-release.apk
    apkPath := filepath.Join(projectDir, "build", "app", "outputs", "flutter-apk", "app-release.apk")

    // Move or copy to a public location for download
    // For simplicity, just leave it in buildsDir
    // You could also upload to S3 and return a URL

    // Update status (this is simplified; you'd use a database)
}

package main

import (
    "context"
    "encoding/json"
    "time"

    "github.com/go-redis/redis/v8"
)

var ctx = context.Background()

type QueueClient struct {
    client *redis.Client
}

type BuildJob struct {
    BuildID   string            `json:"build_id"`
    ProjectID string            `json:"project_id"`
    Platform  string            `json:"platform"` // "flutter", "react-native", etc.
    Files     map[string]string `json:"files"`
    Status    string            `json:"status"`
    CreatedAt time.Time         `json:"created_at"`
}

func NewQueueClient(addr, password string, db int) *QueueClient {
    rdb := redis.NewClient(&redis.Options{
        Addr:     addr,
        Password: password,
        DB:       db,
    })
    return &QueueClient{client: rdb}
}

// PushBuild pushes a build job to the queue (list)
func (q *QueueClient) PushBuild(job *BuildJob) error {
    data, err := json.Marshal(job)
    if err != nil {
        return err
    }
    return q.client.LPush(ctx, "build_queue", data).Err()
}

// PopBuild pops a build job from the queue (blocking)
func (q *QueueClient) PopBuild() (*BuildJob, error) {
    data, err := q.client.BRPop(ctx, 0, "build_queue").Result()
    if err != nil {
        return nil, err
    }
    // data is [key, value] – we need the value
    var job BuildJob
    if err := json.Unmarshal([]byte(data[1]), &job); err != nil {
        return nil, err
    }
    return &job, nil
}

// UpdateBuildStatus stores build status in Redis (for polling)
func (q *QueueClient) UpdateBuildStatus(buildID, status, downloadURL string) error {
    job := map[string]interface{}{
        "status":      status,
        "downloadURL": downloadURL,
        "updatedAt":   time.Now(),
    }
    return q.client.HSet(ctx, "build:"+buildID, job).Err()
}

// GetBuildStatus retrieves build status
func (q *QueueClient) GetBuildStatus(buildID string) (map[string]string, error) {
    return q.client.HGetAll(ctx, "build:"+buildID).Result()
}

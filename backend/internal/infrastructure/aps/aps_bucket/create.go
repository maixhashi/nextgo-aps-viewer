package aps_bucket

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "github.com/google/uuid"
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

func (r *APSBucketRepository) CreateBucket(token string) (*domain.APSBucket, error) {
    bucketKey := fmt.Sprintf("my-aps-bucket-%s", uuid.New().String())
    
    requestBody := struct {
        BucketKey string `json:"bucketKey"`
        PolicyKey string `json:"policyKey"`
    }{
        BucketKey: bucketKey,
        PolicyKey: "transient",
    }
    
    jsonData, err := json.Marshal(requestBody)
    if err != nil {
        return nil, err
    }

    req, err := http.NewRequest("POST", 
        "https://developer.api.autodesk.com/oss/v2/buckets",
        bytes.NewBuffer(jsonData))
    if err != nil {
        return nil, err
    }

    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer "+token)

    resp, err := r.client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        bodyBytes, _ := io.ReadAll(resp.Body)
        return nil, fmt.Errorf("API error: status=%d, body=%s", resp.StatusCode, string(bodyBytes))
    }

    bodyBytes, err := io.ReadAll(resp.Body)
    if err != nil {
        return nil, err
    }

    var bucket domain.APSBucket
    if err := json.Unmarshal(bodyBytes, &bucket); err != nil {
        return nil, fmt.Errorf("failed to unmarshal response: %v", err)
    }

    return &bucket, nil
}
package aps

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "github.com/maixhashi/nextgo-aps-viewer/internal/domain"
)

type APSBucketRepository struct {
    endpoint string
}

func NewAPSBucketRepository() *APSBucketRepository {
    return &APSBucketRepository{
        endpoint: "https://developer.api.autodesk.com",
    }
}

type bucketRequest struct {
    BucketKey string `json:"bucketKey"`
    PolicyKey string `json:"policyKey"`
}

func (r *APSBucketRepository) CreateBucket(accessToken string, bucketKey string, policyKey string) (*domain.Bucket, error) {
    payload := bucketRequest{
        BucketKey: bucketKey,
        PolicyKey: policyKey,
    }
    
    jsonData, err := json.Marshal(payload)
    if err != nil {
        return nil, fmt.Errorf("failed to marshal payload: %v", err)
    }

    req, err := http.NewRequest("POST", r.endpoint+"/oss/v2/buckets", bytes.NewBuffer(jsonData))
    if err != nil {
        return nil, err
    }

    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer "+accessToken)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("bucket creation failed: status code %d", resp.StatusCode)
    }

    var bucket domain.Bucket
    if err := json.NewDecoder(resp.Body).Decode(&bucket); err != nil {
        return nil, err
    }

    return &bucket, nil
}
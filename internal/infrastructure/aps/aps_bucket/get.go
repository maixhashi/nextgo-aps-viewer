package aps_bucket

import (
    "encoding/json"
    "fmt"
    "net/http"
    
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

type BucketsResponse struct {
    Items []domain.APSBucket `json:"items"`
    Next  string            `json:"next"`
}

func (r *APSBucketRepository) GetBuckets(token string) (*domain.BucketsResponse, error) {
    url := "https://developer.api.autodesk.com/oss/v2/buckets"
    
    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        return nil, fmt.Errorf("failed to create request: %w", err)
    }

    req.Header.Set("Authorization", "Bearer "+token)
    
    resp, err := r.client.Do(req)
    if err != nil {
        return nil, fmt.Errorf("failed to send request: %w", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode == http.StatusForbidden {
        return nil, fmt.Errorf("access denied: check if token has bucket:read scope")
    }

    var bucketsResp domain.BucketsResponse
    if err := json.NewDecoder(resp.Body).Decode(&bucketsResp); err != nil {
        return nil, fmt.Errorf("failed to decode response: %w", err)
    }

    return &bucketsResp, nil
}
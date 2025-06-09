package aps_bucket

import (
    "encoding/json"
    "fmt"
    "net/http"

    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

func (r *APSBucketRepository) GetBucketDetail(token string, bucketKey string) (*domain.APSBucketDetail, error) {
    url := fmt.Sprintf("https://developer.api.autodesk.com/oss/v2/buckets/%s/details", bucketKey)
    
    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        return nil, err
    }

    req.Header.Set("Authorization", "Bearer "+token)
    req.Header.Set("Content-Type", "application/json")

    resp, err := r.client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("API request failed with status: %d", resp.StatusCode)
    }

    var detail domain.APSBucketDetail
    if err := json.NewDecoder(resp.Body).Decode(&detail); err != nil {
        return nil, err
    }

    return &detail, nil
}
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

func (r *APSBucketRepository) GetBuckets(accessToken string) ([]domain.Bucket, error) {
    // クエリパラメータを追加
    url := fmt.Sprintf("%s/oss/v2/buckets?limit=100", r.endpoint)
    
    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        return nil, err
    }

    req.Header.Set("Authorization", "Bearer "+accessToken)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("failed to get buckets: status code %d", resp.StatusCode)
    }

    type bucketsResponse struct {
        Items []domain.Bucket `json:"items"`
    }

    var response bucketsResponse
    if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
        return nil, err
    }

    return response.Items, nil
}

func (r *APSBucketRepository) DeleteBucket(accessToken string, bucketKey string) error {
    url := fmt.Sprintf("%s/oss/v2/buckets/%s", r.endpoint, bucketKey)
    
    req, err := http.NewRequest("DELETE", url, nil)
    if err != nil {
        return err
    }

    req.Header.Set("Authorization", "Bearer "+accessToken)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return fmt.Errorf("failed to delete bucket: status code %d", resp.StatusCode)
    }

    return nil
}

func (r *APSBucketRepository) GetBucketDetails(accessToken string, bucketKey string) (*domain.Bucket, error) {
    url := fmt.Sprintf("%s/oss/v2/buckets/%s/details", r.endpoint, bucketKey)
    
    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        return nil, err
    }

    req.Header.Set("Authorization", "Bearer "+accessToken)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("failed to get bucket details: status code %d", resp.StatusCode)
    }

    var bucket domain.Bucket
    if err := json.NewDecoder(resp.Body).Decode(&bucket); err != nil {
        return nil, err
    }

    return &bucket, nil
}
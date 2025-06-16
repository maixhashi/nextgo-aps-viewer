package aps_bucket

import (
    "fmt"
    "net/http"
)

func (r *APSBucketRepository) DeleteBucket(token string, bucketKey string) error {
    url := fmt.Sprintf("%s/buckets/%s", r.baseURL, bucketKey)
    
    req, err := http.NewRequest("DELETE", url, nil)
    if err != nil {
        return err
    }

    req.Header.Set("Authorization", "Bearer "+token)

    resp, err := r.client.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return fmt.Errorf("failed to delete bucket: %d", resp.StatusCode)
    }

    return nil
}
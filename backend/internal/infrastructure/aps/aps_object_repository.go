package aps

import (
    "encoding/json"
    "fmt"
    "net/http"
    "github.com/maixhashi/nextgo-aps-viewer/internal/domain"
)

type APSObjectRepository struct {
    endpoint string
}

func NewAPSObjectRepository() *APSObjectRepository {
    return &APSObjectRepository{
        endpoint: "https://developer.api.autodesk.com",
    }
}

type signedUrlResponse struct {
    BucketKey   string `json:"bucketKey"`
    ObjectKey   string `json:"objectKey"`
    ObjectId    string `json:"objectId"`
    UploadKey   string `json:"uploadKey"`
    UploadUrl   string `json:"uploadUrl"`
    // 他のフィールドも必要に応じて追加
}

func (r *APSObjectRepository) GetSignedUrl(accessToken string, bucketKey string, objectKey string) (*domain.Object, error) {
    url := fmt.Sprintf("%s/oss/v2/buckets/%s/objects/%s/signeds3upload", r.endpoint, bucketKey, objectKey)
    
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
        return nil, fmt.Errorf("failed to get signed URL: status code %d", resp.StatusCode)
    }

    var object domain.Object
    if err := json.NewDecoder(resp.Body).Decode(&object); err != nil {
        return nil, err
    }

    // bucketKeyとobjectKeyを設定
    object.BucketKey = bucketKey
    object.ObjectKey = objectKey

    return &object, nil
}
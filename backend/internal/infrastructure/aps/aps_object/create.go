package aps_object

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

func (r *APSObjectRepository) CreateObject(bucketKey, objectKey, uploadKey string) (*domain.APSObject, error) {
    url := fmt.Sprintf("https://developer.api.autodesk.com/oss/v2/buckets/%s/objects/%s/signeds3upload", 
        bucketKey, objectKey)

    reqBody := map[string]string{
        "uploadKey": uploadKey,
    }
    jsonBody, err := json.Marshal(reqBody)
    if err != nil {
        return nil, err
    }

    req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
    if err != nil {
        return nil, err
    }

    token, err := r.tokenRepo.GetToken()
    if err != nil {
        return nil, err
    }

    req.Header.Set("Authorization", "Bearer "+token.AccessToken)
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("x-ads-meta-Content-Type", "application/octet-stream")

    resp, err := r.client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var apsObject domain.APSObject
    if err := json.NewDecoder(resp.Body).Decode(&apsObject); err != nil {
        return nil, err
    }

    return &domain.APSObject{
        BucketKey:   bucketKey,
        ObjectId:    fmt.Sprintf("urn:adsk.objects:os.object:%s/%s", bucketKey, objectKey),
        ObjectKey:   objectKey,
        Size:        12582912, // サイズは実際のファイルサイズに応じて設定
        ContentType: "application/octet-stream",
        Location:    fmt.Sprintf("https://developer.api.autodesk.com/oss/v2/buckets/%s/objects/%s", bucketKey, objectKey),
    }, nil
}
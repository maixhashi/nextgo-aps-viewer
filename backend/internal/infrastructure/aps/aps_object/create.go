package aps_object

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

func (r *APSObjectRepository) CreateObject(bucketKey string, objectKey string, uploadKey string) (*domain.APSObject, error) {
    // Generate objectId in correct format
    objectId := fmt.Sprintf("%s/%s", bucketKey, objectKey)
    
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

    // Create APSObject with the generated objectId
    apsObject = domain.APSObject{
        ObjectId: objectId,
        BucketKey: bucketKey,
        ObjectKey: objectKey,
        Location: "",  // Set appropriate value if needed
        Size: 0,      // Set appropriate value if needed
    }
    
    return &apsObject, nil
}
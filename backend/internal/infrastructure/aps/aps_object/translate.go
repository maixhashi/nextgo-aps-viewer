package aps_object

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

func (r *APSObjectRepository) TranslateObject(base64URN string, objectKey string) (*domain.TranslateJobResponse, error) {
    // アクセストークンを取得
    token, err := r.tokenRepo.GetToken()
    if err != nil {
        return nil, fmt.Errorf("failed to get access token: %w", err)
    }

    // リクエストボディを作成
    requestBody := map[string]interface{}{
        "input": map[string]interface{}{
            "urn":           base64URN,
            "compressedUrn": false,
            "rootFilename":  objectKey,
        },
        "output": map[string]interface{}{
            "formats": []map[string]interface{}{
                {
                    "type": "svf",
                    "views": []string{"2d", "3d"},
                },
            },
        },
    }

    jsonBody, err := json.Marshal(requestBody)
    if err != nil {
        return nil, fmt.Errorf("failed to marshal request body: %w", err)
    }

    // APIリクエストを作成
    req, err := http.NewRequest("POST", 
        "https://developer.api.autodesk.com/modelderivative/v2/designdata/job",
        bytes.NewBuffer(jsonBody))
    if err != nil {
        return nil, fmt.Errorf("failed to create request: %w", err)
    }

    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer "+token.AccessToken)

    // リクエストを送信
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, fmt.Errorf("failed to send request: %w", err)
    }
    defer resp.Body.Close()

    // レスポンスを解析
    var response domain.TranslateJobResponse
    if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
        return nil, fmt.Errorf("failed to decode response: %w", err)
    }

    return &response, nil
}
package aps_object

import (
    "encoding/json"
    "fmt"
    "net/http"
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

func (r *APSObjectRepository) TrackTranslationJobStatus(urn string) (*domain.TranslationStatus, error) {
    token, err := r.tokenRepo.GetToken()
    if err != nil {
        return nil, fmt.Errorf("failed to get access token: %w", err)
    }

    req, err := http.NewRequest("GET", 
        fmt.Sprintf("https://developer.api.autodesk.com/modelderivative/v2/designdata/%s/manifest", urn),
        nil)
    if err != nil {
        return nil, fmt.Errorf("failed to create request: %w", err)
    }

    req.Header.Set("Authorization", "Bearer "+token.AccessToken)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, fmt.Errorf("failed to send request: %w", err)
    }
    defer resp.Body.Close()

    var status domain.TranslationStatus
    if err := json.NewDecoder(resp.Body).Decode(&status); err != nil {
        return nil, fmt.Errorf("failed to decode response: %w", err)
    }

    return &status, nil
}
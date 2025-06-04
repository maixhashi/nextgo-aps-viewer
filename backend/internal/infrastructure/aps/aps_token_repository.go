package aps

import (
    "encoding/json"
    "fmt"
    "net/http"
    "net/url"
    "strings"
    "github.com/maixhashi/nextgo-aps-viewer/internal/domain"
)

type apsTokenResponse struct {
    AccessToken  string `json:"access_token"`
    TokenType    string `json:"token_type"`
    ExpiresIn    int    `json:"expires_in"`
    RefreshToken string `json:"refresh_token"`
}

type APSTokenRepository struct {
    endpoint string
}

func NewAPSTokenRepository() *APSTokenRepository {
    return &APSTokenRepository{
        endpoint: "https://developer.api.autodesk.com/authentication/v2/token",
    }
}

// For testing purposes
func NewAPSTokenRepositoryWithEndpoint(endpoint string) *APSTokenRepository {
    return &APSTokenRepository{
        endpoint: endpoint,
    }
}

func (r *APSTokenRepository) GetToken(clientID string, clientSecret string, scope string) (*domain.APSToken, error) {
    data := url.Values{}
    data.Set("client_id", clientID)
    data.Set("client_secret", clientSecret)
    data.Set("grant_type", "client_credentials")
    data.Set("scope", scope)

    req, err := http.NewRequest("POST", "https://developer.api.autodesk.com/authentication/v2/token",
        strings.NewReader(data.Encode()))
    if err != nil {
        return nil, fmt.Errorf("request creation failed: %v", err)
    }

    req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, fmt.Errorf("request failed: %v", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("APS API error: status code %d", resp.StatusCode)
    }

    var tokenResp apsTokenResponse
    if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
        return nil, fmt.Errorf("failed to decode response: %v", err)
    }

    return &domain.APSToken{
        AccessToken:  tokenResp.AccessToken,
        TokenType:    tokenResp.TokenType,
        ExpiresIn:    tokenResp.ExpiresIn,
        RefreshToken: tokenResp.RefreshToken,
    }, nil
}
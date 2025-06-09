package aps_token

import (
    "encoding/json"
    "net/http"
    "net/url"
    "os"
    "strings"

    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

func (r *APSTokenRepository) GetToken() (*domain.APSToken, error) {
    clientID := os.Getenv("APS_CLIENT_ID")
    clientSecret := os.Getenv("APS_CLIENT_SECRET")
    
    data := url.Values{}
    data.Set("grant_type", "client_credentials")
    data.Set("scope", "data:read data:create bucket:read bucket:create bucket:delete") 
    
    req, err := http.NewRequest("POST", "https://developer.api.autodesk.com/authentication/v2/token", 
        strings.NewReader(data.Encode()))
    if err != nil {
        return nil, err
    }
    
    req.SetBasicAuth(clientID, clientSecret)
    req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
    
    resp, err := r.client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    var token domain.APSToken
    if err := json.NewDecoder(resp.Body).Decode(&token); err != nil {
        return nil, err
    }
    
    return &token, nil
}
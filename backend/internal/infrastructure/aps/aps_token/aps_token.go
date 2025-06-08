package aps_token

import (
    "net/http"
)

type APSTokenRepository struct {
    client *http.Client
}

func NewAPSTokenRepository() *APSTokenRepository {
    return &APSTokenRepository{
        client: &http.Client{},
    }
}
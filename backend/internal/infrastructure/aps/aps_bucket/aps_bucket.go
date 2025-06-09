package aps_bucket

import (
    "net/http"
)

type APSBucketRepository struct {
    client  *http.Client
    baseURL string
}

func NewAPSBucketRepository(client *http.Client) *APSBucketRepository {
    return &APSBucketRepository{
        client:  client,
        baseURL: "https://developer.api.autodesk.com/oss/v2",
    }
}
package aps_bucket

import (
    "net/http"
)

type APSBucketRepository struct {
    client *http.Client
}

func NewAPSBucketRepository() *APSBucketRepository {
    return &APSBucketRepository{
        client: &http.Client{},
    }
}
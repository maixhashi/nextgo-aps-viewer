package aps_bucket

import (
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/usecase/aps_bucket"
)

type APSBucketHandler struct {
    bucketUseCase *aps_bucket.APSBucketUseCase
}

func NewAPSBucketHandler(bucketUseCase *aps_bucket.APSBucketUseCase) *APSBucketHandler {
    return &APSBucketHandler{
        bucketUseCase: bucketUseCase,
    }
}
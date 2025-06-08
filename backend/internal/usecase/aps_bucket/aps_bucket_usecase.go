package aps_bucket

import (
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/usecase/aps_token"
)

type APSBucketUseCase struct {
    bucketRepo domain.APSBucketRepository
    tokenUseCase *aps_token.APSTokenUseCase
}

func NewAPSBucketUseCase(bucketRepo domain.APSBucketRepository, tokenUseCase *aps_token.APSTokenUseCase) *APSBucketUseCase {
    return &APSBucketUseCase{
        bucketRepo: bucketRepo,
        tokenUseCase: tokenUseCase,
    }
}
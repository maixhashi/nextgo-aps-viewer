package aps_bucket

import (
    "context"
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

func (u *APSBucketUseCase) GetBuckets(ctx context.Context) (*domain.BucketsResponse, error) {
    token, err := u.tokenUseCase.GetToken()
    if err != nil {
        return nil, err
    }
    
    return u.bucketRepo.GetBuckets(token.AccessToken)
}
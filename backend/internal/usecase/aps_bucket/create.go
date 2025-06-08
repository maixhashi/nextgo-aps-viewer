package aps_bucket

import (
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

func (u *APSBucketUseCase) CreateBucket() (*domain.APSBucket, error) {
    token, err := u.tokenUseCase.GetToken()
    if err != nil {
        return nil, err
    }
    
    return u.bucketRepo.CreateBucket(token.AccessToken)
}
package usecase

import (
    "github.com/maixhashi/nextgo-aps-viewer/internal/domain"
)

type APSBucketUseCase struct {
    bucketRepo domain.BucketRepository
    authUseCase *APSAuthUseCase
    clientID string
    clientSecret string
}

func NewAPSBucketUseCase(bucketRepo domain.BucketRepository, authUseCase *APSAuthUseCase, clientID, clientSecret string) *APSBucketUseCase {
    return &APSBucketUseCase{
        bucketRepo: bucketRepo,
        authUseCase: authUseCase,
        clientID: clientID,
        clientSecret: clientSecret,
    }
}

func (u *APSBucketUseCase) CreateBucket(bucketKey string) (*domain.Bucket, error) {
    token, err := u.authUseCase.GetToken(
        u.clientID, 
        u.clientSecret, 
        "bucket:create bucket:read")
    if err != nil {
        return nil, err
    }

    return u.bucketRepo.CreateBucket(token.AccessToken, bucketKey, "transient")
}
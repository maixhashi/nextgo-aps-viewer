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

func (u *APSBucketUseCase) GetBuckets() ([]domain.Bucket, error) {
    token, err := u.authUseCase.GetToken(
        u.clientID, 
        u.clientSecret, 
        "bucket:read")
    if err != nil {
        return nil, err
    }

    return u.bucketRepo.GetBuckets(token.AccessToken)
}

func (u *APSBucketUseCase) DeleteBucket(bucketKey string) error {
    token, err := u.authUseCase.GetToken(
        u.clientID, 
        u.clientSecret, 
        "bucket:delete")
    if err != nil {
        return err
    }

    return u.bucketRepo.DeleteBucket(token.AccessToken, bucketKey)
}

func (u *APSBucketUseCase) GetBucketDetails(bucketKey string) (*domain.Bucket, error) {
    token, err := u.authUseCase.GetToken(
        u.clientID, 
        u.clientSecret, 
        "bucket:read")
    if err != nil {
        return nil, err
    }

    return u.bucketRepo.GetBucketDetails(token.AccessToken, bucketKey)
}
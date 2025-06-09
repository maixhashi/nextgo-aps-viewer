package aps_bucket

import "github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"

func (u *APSBucketUseCase) GetBucketDetail(bucketKey string) (*domain.APSBucketDetail, error) {
    token, err := u.tokenUseCase.GetToken()
    if err != nil {
        return nil, err
    }

    return u.bucketRepo.GetBucketDetail(token.AccessToken, bucketKey)
}
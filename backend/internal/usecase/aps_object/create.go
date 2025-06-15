package aps_object

import (
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

func (u *APSObjectUseCase) CreateObject(bucketKey, objectKey, uploadKey string) (*domain.APSObject, error) {
    return u.objectRepo.CreateObject(bucketKey, objectKey, uploadKey)
}
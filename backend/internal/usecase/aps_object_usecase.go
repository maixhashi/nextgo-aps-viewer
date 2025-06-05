package usecase

import (
    "github.com/maixhashi/nextgo-aps-viewer/internal/domain"
)

type APSObjectUseCase struct {
    objectRepo  domain.ObjectRepository
    authUseCase *APSAuthUseCase
    clientID    string
    clientSecret string
}

func NewAPSObjectUseCase(objectRepo domain.ObjectRepository, authUseCase *APSAuthUseCase, clientID, clientSecret string) *APSObjectUseCase {
    return &APSObjectUseCase{
        objectRepo:    objectRepo,
        authUseCase:  authUseCase,
        clientID:     clientID,
        clientSecret: clientSecret,
    }
}

func (u *APSObjectUseCase) GetSignedUrl(bucketKey string, objectKey string) (*domain.Object, error) {
    token, err := u.authUseCase.GetToken(
        u.clientID,
        u.clientSecret,
        "data:write")
    if err != nil {
        return nil, err
    }

    return u.objectRepo.GetSignedUrl(token.AccessToken, bucketKey, objectKey)
}
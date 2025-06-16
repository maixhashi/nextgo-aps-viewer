package aps_token

import (
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

func (u *APSTokenUseCase) GetToken() (*domain.APSToken, error) {
    return u.tokenRepo.GetToken()
}
package aps_token

import (
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

type APSTokenUseCase struct {
    tokenRepo domain.APSTokenRepository
}

func NewAPSTokenUseCase(tokenRepo domain.APSTokenRepository) *APSTokenUseCase {
    return &APSTokenUseCase{
        tokenRepo: tokenRepo,
    }
}
package aps_token

import (
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/usecase/aps_token"
)

type APSTokenHandler struct {
    tokenUseCase *aps_token.APSTokenUseCase
}

func NewAPSTokenHandler(tokenUseCase *aps_token.APSTokenUseCase) *APSTokenHandler {
    return &APSTokenHandler{
        tokenUseCase: tokenUseCase,
    }
}
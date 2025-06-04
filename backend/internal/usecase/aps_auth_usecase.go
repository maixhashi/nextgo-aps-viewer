package usecase

import (
    "github.com/maixhashi/nextgo-aps-viewer/internal/domain"
)

type APSAuthUseCase struct {
    apsRepo domain.APSTokenRepository
}

func NewAPSAuthUseCase(apsRepo domain.APSTokenRepository) *APSAuthUseCase {
    return &APSAuthUseCase{
        apsRepo: apsRepo,
    }
}

func (u *APSAuthUseCase) GetToken(clientID string, clientSecret string, scope string) (*domain.APSToken, error) {
    return u.apsRepo.GetToken(clientID, clientSecret, scope)
}
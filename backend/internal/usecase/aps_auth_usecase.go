package usecase

import "github.com/maixhashi/nextgo-aps-viewer/internal/domain"

type APSAuthUseCase struct {
    repository domain.APSTokenRepository
}

func NewAPSAuthUseCase(repo domain.APSTokenRepository) *APSAuthUseCase {
    return &APSAuthUseCase{repository: repo}
}

func (u *APSAuthUseCase) GetAuthToken(clientID string, clientSecret string) (*domain.APSToken, error) {
    scope := "data:read data:write"
    return u.repository.GetToken(clientID, clientSecret, scope)
}
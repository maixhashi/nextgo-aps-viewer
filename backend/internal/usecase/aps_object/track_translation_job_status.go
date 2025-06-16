package aps_object

import (
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

func (u *APSObjectUseCase) TrackTranslationJobStatus(urn string) (*domain.TranslationStatus, error) {
    return u.objectRepo.TrackTranslationJobStatus(urn)
}
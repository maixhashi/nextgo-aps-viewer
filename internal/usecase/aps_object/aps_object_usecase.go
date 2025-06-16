package aps_object

import (
	"github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

// APSObjectUseCase はAPSオブジェクトのユースケース実装
type APSObjectUseCase struct {
	objectRepo domain.APSObjectRepository
}

// NewAPSObjectUseCase は新しいAPSObjectUseCaseを作成します
func NewAPSObjectUseCase(objectRepo domain.APSObjectRepository) *APSObjectUseCase {
	return &APSObjectUseCase{
		objectRepo: objectRepo,
	}
}

// インターフェースの実装を確認
var _ domain.APSObjectUseCase = (*APSObjectUseCase)(nil)

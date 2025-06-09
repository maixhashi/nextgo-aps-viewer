package aps_object

import (
	"github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
	"github.com/maixhashi/nextgo-aps-viewer/backend/internal/infrastructure/aps/aps_token"
)

// APSObjectRepository はAPSオブジェクトのリポジトリ実装
type APSObjectRepository struct {
	tokenRepo *aps_token.APSTokenRepository
}

// NewAPSObjectRepository は新しいAPSObjectRepositoryを作成します
func NewAPSObjectRepository(tokenRepo *aps_token.APSTokenRepository) *APSObjectRepository {
	return &APSObjectRepository{
		tokenRepo: tokenRepo,
	}
}

// インターフェースの実装を確認
var _ domain.APSObjectRepository = (*APSObjectRepository)(nil)

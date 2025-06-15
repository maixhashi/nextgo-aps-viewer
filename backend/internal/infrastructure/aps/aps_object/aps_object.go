package aps_object

import (
	"net/http"
	"github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

// APSObjectRepository はAPSオブジェクトのリポジトリ実装
type APSObjectRepository struct {
	client    *http.Client
	tokenRepo domain.APSTokenRepository
}

// NewAPSObjectRepository は新しいAPSObjectRepositoryを作成します
func NewAPSObjectRepository(client *http.Client, tokenRepo domain.APSTokenRepository) *APSObjectRepository {
	return &APSObjectRepository{
		client:    client,
		tokenRepo: tokenRepo,
	}
}

// インターフェースの実装を確認
var _ domain.APSObjectRepository = (*APSObjectRepository)(nil)

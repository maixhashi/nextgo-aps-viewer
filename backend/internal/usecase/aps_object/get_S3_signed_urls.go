package aps_object

import (
	"github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

// GetS3SignedURLs はS3署名付きURLを取得します
func (u *APSObjectUseCase) GetS3SignedURLs(bucketKey string, objectKey string, parts int) (*domain.APSObject, error) {
	// リポジトリ層に処理を委譲
	return u.objectRepo.GetS3SignedURLs(bucketKey, objectKey, parts)
}

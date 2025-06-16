package aps_object

import (
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

// TranslateObject はオブジェクトの翻訳ジョブを作成します
func (u *APSObjectUseCase) TranslateObject(base64URN string, objectKey string) (*domain.TranslateJobResponse, error) {
    // リポジトリ層に処理を委譲
    return u.objectRepo.TranslateObject(base64URN, objectKey)
}
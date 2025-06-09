package aps_object

import (
	"github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

// APSObjectHandler はAPSオブジェクトのハンドラ
type APSObjectHandler struct {
	objectUseCase domain.APSObjectUseCase
}

// NewAPSObjectHandler は新しいAPSObjectHandlerを作成します
func NewAPSObjectHandler(objectUseCase domain.APSObjectUseCase) *APSObjectHandler {
	return &APSObjectHandler{
		objectUseCase: objectUseCase,
	}
}

// ErrorResponse はエラーレスポンスの構造体
type ErrorResponse struct {
	Error string `json:"error"`
}

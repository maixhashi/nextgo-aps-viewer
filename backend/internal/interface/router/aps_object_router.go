package router

import (
	"github.com/gorilla/mux"
	"github.com/maixhashi/nextgo-aps-viewer/backend/internal/interface/handler/aps_object"
)

// SetAPSObjectRoutes はAPSオブジェクト関連のルートを設定します
func SetAPSObjectRoutes(router *mux.Router, handler *aps_object.APSObjectHandler) {
	// S3署名付きURLの取得
	router.HandleFunc("/api/v1/aps/buckets/{bucketKey}/objects/signeds3upload", handler.GetS3SignedURLs).Methods("POST")
}

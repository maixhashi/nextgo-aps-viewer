package router

import (
	"github.com/gorilla/mux"
	"github.com/maixhashi/nextgo-aps-viewer/backend/internal/interface/handler/aps_object"
)

// SetAPSObjectRoutes はAPSオブジェクト関連のルートを設定します
func SetAPSObjectRoutes(router *mux.Router, handler *aps_object.APSObjectHandler) {
	// S3署名付きURLの取得
	router.HandleFunc("/api/v1/aps/buckets/{bucketKey}/objects/signeds3upload", handler.GetS3SignedURLs).Methods("POST")
	
	// APSオブジェクトのアップロードシーケンス（署名付きURL取得→アップロード）
	router.HandleFunc("/api/v1/aps/buckets/{bucketKey}/objects/upload", handler.UploadAPSObjectSequence).Methods("POST")
	
	// 既存のルートに追加
	router.HandleFunc("/api/v1/aps/buckets/{bucketKey}/objects/{objectKey}/signeds3upload", 
		handler.CreateObject).Methods("POST")
}

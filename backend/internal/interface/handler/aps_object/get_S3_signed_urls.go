package aps_object

import (
	"encoding/json"
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"

	"github.com/gorilla/mux"
)

// @Summary S3署名付きURLの取得
// @Description オブジェクトをS3へ保存するためのS3署名付きURLを取得します
// @Tags APS Object
// @Accept multipart/form-data
// @Produce json
// @Param bucketKey path string true "バケットキー"
// @Param file formData file true "アップロードするファイル"
// @Param parts query int false "パート数" default(1)
// @Success 200 {object} domain.APSObject
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/aps/buckets/{bucketKey}/objects/signeds3upload [post]
func (h *APSObjectHandler) GetS3SignedURLs(w http.ResponseWriter, r *http.Request) {
	// URLパラメータからバケットキーを取得
	vars := mux.Vars(r)
	bucketKey := vars["bucketKey"]
	if bucketKey == "" {
		http.Error(w, "bucket key is required", http.StatusBadRequest)
		return
	}

	// クエリパラメータからパート数を取得（デフォルトは1）
	partsStr := r.URL.Query().Get("parts")
	parts := 1
	if partsStr != "" {
		var err error
		parts, err = strconv.Atoi(partsStr)
		if err != nil {
			http.Error(w, "invalid parts parameter", http.StatusBadRequest)
			return
		}
	}

	// マルチパートフォームを解析（最大32MBまで）
	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		http.Error(w, "failed to parse multipart form: "+err.Error(), http.StatusBadRequest)
		return
	}

	// アップロードされたファイルを取得
	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "failed to get uploaded file: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	// ファイル名をオブジェクトキーとして使用
	objectKey := handler.Filename
	if objectKey == "" {
		http.Error(w, "file name cannot be empty", http.StatusBadRequest)
		return
	}

	// ファイル名から拡張子を取得して、サポートされているファイル形式かチェック
	ext := filepath.Ext(objectKey)
	// 必要に応じてサポートされているファイル形式をチェック
	// 例: .rvt, .rfa, .dwg など
	fmt.Printf("File uploaded: %s, Size: %d bytes, Extension: %s\n", objectKey, handler.Size, ext)

	// ユースケース層に処理を委譲
	apsObject, err := h.objectUseCase.GetS3SignedURLs(bucketKey, objectKey, parts)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// レスポンスを返す
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(apsObject)
}

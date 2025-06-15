package aps_object

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/gorilla/mux"
)

// @Summary APSオブジェクトのアップロードシーケンス
// @Description S3署名付きURLを取得してオブジェクトをアップロードするシーケンスを実行します
// @Tags APS Object
// @Accept multipart/form-data
// @Produce json
// @Param bucketKey path string true "バケットキー"
// @Param file formData file true "アップロードするファイル"
// @Param parts query int false "パート数" default(1)
// @Success 200 {object} map[string]string
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/aps/buckets/{bucketKey}/objects/upload [post]
func (h *APSObjectHandler) UploadAPSObjectSequence(w http.ResponseWriter, r *http.Request) {
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

	// ファイル内容を一時ファイルに保存
	tempFile, err := saveToTempFile(file, objectKey)
	if err != nil {
		http.Error(w, "failed to save file: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer os.Remove(tempFile) // 処理完了後に一時ファイルを削除

	// ステップ1: S3署名付きURLを取得
	apsObject, err := h.objectUseCase.GetS3SignedURLs(bucketKey, objectKey, parts)
	if err != nil {
		http.Error(w, "failed to get signed URLs: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// URLが取得できなかった場合
	if len(apsObject.URLs) == 0 {
		http.Error(w, "no signed URLs returned", http.StatusInternalServerError)
		return
	}

	// ステップ2: 一時ファイルの内容を読み込み
	fileContent, err := os.ReadFile(tempFile)
	if err != nil {
		http.Error(w, "failed to read temp file: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// ステップ3: S3署名付きURLを使用してファイルをアップロード
	// 現在の実装では単一パートのみサポート
	for i, signedURL := range apsObject.URLs {
		err = h.objectUseCase.PutS3SignedURLs(signedURL, fileContent)
		if err != nil {
			http.Error(w, fmt.Sprintf("failed to upload file part %d: %s", i+1, err.Error()), http.StatusInternalServerError)
			return
		}
	}

	// ステップ4: オブジェクトの作成を完了
	finalObject, err := h.objectUseCase.CreateObject(bucketKey, objectKey, apsObject.UploadKey)
	if err != nil {
		http.Error(w, "failed to complete object creation: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Base64エンコードされたURNを生成
	base64URN, err := h.objectUseCase.GenerateBase64EncodedURN(finalObject.ObjectId)
	if err != nil {
		http.Error(w, "failed to generate base64 URN: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// レスポンスに追加
	response := map[string]interface{}{
		"object": finalObject,
		"base64EncodedURN": base64URN,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// 一時ファイルに保存するヘルパー関数
func saveToTempFile(src io.Reader, originalName string) (string, error) {
	// 一時ディレクトリに元のファイル名を使用して一時ファイルを作成
	ext := filepath.Ext(originalName)
	tempFile, err := os.CreateTemp("", "upload-*"+ext)
	if err != nil {
		return "", fmt.Errorf("failed to create temp file: %w", err)
	}
	defer tempFile.Close()

	// ファイル内容をコピー
	_, err = io.Copy(tempFile, src)
	if err != nil {
		return "", fmt.Errorf("failed to copy file content: %w", err)
	}

	return tempFile.Name(), nil
}

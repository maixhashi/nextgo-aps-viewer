package aps_object

import (
	"encoding/json"
	"io"
	"net/http"
)

// @Summary S3署名付きURLを使用したオブジェクトのアップロード
// @Description S3署名付きURLを使用してオブジェクトをS3へアップロードします
// @Tags APS Object
// @Accept octet-stream
// @Produce json
// @Param signedURL query string true "署名付きURL"
// @Param file body []byte true "アップロードするファイルのバイナリデータ"
// @Success 200 {object} map[string]string
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/aps/objects/signeds3upload [put]
func (h *APSObjectHandler) PutS3SignedURLs(w http.ResponseWriter, r *http.Request) {
	// クエリパラメータから署名付きURLを取得
	signedURL := r.URL.Query().Get("signedURL")
	if signedURL == "" {
		http.Error(w, "signed URL is required", http.StatusBadRequest)
		return
	}

	// リクエストボディからファイルコンテンツを読み取り
	fileContent, err := readRequestBody(r)
	if err != nil {
		http.Error(w, "failed to read file content: "+err.Error(), http.StatusBadRequest)
		return
	}

	// ユースケース層に処理を委譲
	err = h.objectUseCase.PutS3SignedURLs(signedURL, fileContent)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// レスポンスを返す
	w.Header().Set("Content-Type", "application/json")
	response := map[string]string{
		"message": "Upload to S3 using signed URL completed.",
	}
	json.NewEncoder(w).Encode(response)
}

// リクエストボディからファイルコンテンツを読み取るヘルパー関数
func readRequestBody(r *http.Request) ([]byte, error) {
	// 最大32MBまでに制限
	limitedReader := http.MaxBytesReader(nil, r.Body, 32<<20)
	// リクエストボディを読み取り
	return io.ReadAll(limitedReader)
}

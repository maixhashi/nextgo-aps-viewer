package aps_object

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
)

// PutS3SignedURLs はS3署名付きURLを使用してオブジェクトをアップロードします
func (r *APSObjectRepository) PutS3SignedURLs(signedURL string, fileContent []byte) error {
	// リクエストを作成
	req, err := http.NewRequest("PUT", signedURL, bytes.NewReader(fileContent))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	// ヘッダーを設定
	req.Header.Set("Content-Type", "application/octet-stream")

	// リクエストを送信
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	// レスポンスを読み取り
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %w", err)
	}

	// ステータスコードをチェック
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("API returned non-OK status: %d, body: %s", resp.StatusCode, string(body))
	}

	return nil
}

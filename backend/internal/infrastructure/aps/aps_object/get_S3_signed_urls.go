package aps_object

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

// GetS3SignedURLs はS3署名付きURLを取得します
func (r *APSObjectRepository) GetS3SignedURLs(bucketKey string, objectKey string, parts int) (*domain.APSObject, error) {
	// アクセストークンを取得
	token, err := r.tokenRepo.GetToken()
	if err != nil {
		return nil, fmt.Errorf("failed to get access token: %w", err)
	}

	// APIエンドポイントを構築
	url := fmt.Sprintf("https://developer.api.autodesk.com/oss/v2/buckets/%s/objects/%s/signeds3upload?parts=%d", 
		bucketKey, objectKey, parts)

	// リクエストを作成
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// ヘッダーを設定
	req.Header.Set("Authorization", "Bearer "+token.AccessToken)
	req.Header.Set("Content-Type", "application/json")

	// リクエストを送信
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	// レスポンスを読み取り
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// ステータスコードをチェック
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned non-OK status: %d, body: %s", resp.StatusCode, string(body))
	}

	// レスポンスをパース
	var apsObject domain.APSObject
	if err := json.Unmarshal(body, &apsObject); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return &apsObject, nil
}

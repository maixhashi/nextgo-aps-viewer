package aps_object

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

// GetS3SignedURLs はS3署名付きURLを取得します
func (r *APSObjectRepository) GetS3SignedURLs(bucketKey string, objectKey string, parts int) (*domain.APSObject, error) {
	// アクセストークンを取得
	token, err := r.tokenRepo.GetToken()
	if err != nil {
		return nil, err
	}

	// APIエンドポイントを構築
	url := fmt.Sprintf("https://developer.api.autodesk.com/oss/v2/buckets/%s/objects/%s/signeds3upload?parts=%d", 
		bucketKey, objectKey, parts)

	// リクエストを作成
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	// ヘッダーを設定
	req.Header.Set("Authorization", "Bearer "+token.AccessToken)
	req.Header.Set("Content-Type", "application/json")

	// リクエストを実行
	resp, err := r.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// レスポンスを解析
	var apiResponse struct {
		URLs             []string `json:"urls"`
		UploadKey       string   `json:"uploadKey"`
		UploadExpiration string   `json:"uploadExpiration"`
		URLExpiration    string   `json:"urlExpiration"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&apiResponse); err != nil {
		return nil, err
	}

	// APSObjectを作成して返す
	apsObject := &domain.APSObject{
		BucketKey:        bucketKey,
		ObjectId:         fmt.Sprintf("urn:adsk.objects:os.object:%s/%s", bucketKey, objectKey),
		ObjectKey:        objectKey,
		ContentType:     "application/octet-stream",
		Location:        fmt.Sprintf("https://developer.api.autodesk.com/oss/v2/buckets/%s/objects/%s", bucketKey, objectKey),
		URLs:            apiResponse.URLs,
		UploadKey:       apiResponse.UploadKey,
		UploadExpiration: apiResponse.UploadExpiration,
		URLExpiration:    apiResponse.URLExpiration,
	}

	return apsObject, nil
}

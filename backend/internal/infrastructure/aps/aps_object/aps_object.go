package aps_object

import (
	"encoding/base64"
	"fmt"
	"net/http"
	"github.com/maixhashi/nextgo-aps-viewer/backend/internal/domain"
)

// APSObjectRepository はAPSオブジェクトのリポジトリ実装
type APSObjectRepository struct {
	client    *http.Client
	tokenRepo domain.APSTokenRepository
}

// NewAPSObjectRepository は新しいAPSObjectRepositoryを作成します
func NewAPSObjectRepository(client *http.Client, tokenRepo domain.APSTokenRepository) *APSObjectRepository {
	return &APSObjectRepository{
		client:    client,
		tokenRepo: tokenRepo,
	}
}

// APSObjectRepository構造体に GenerateBase64EncodedURN メソッドを実装
func (r *APSObjectRepository) GenerateBase64EncodedURN(objectId string) (string, error) {
    // URN形式の文字列を作成（二重エンコードを防ぐ）
    urn := fmt.Sprintf("urn:adsk.objects:os.object:%s", objectId)
    
    // URL-safe Base64エンコード（パディングなし）を使用
    base64URN := base64.RawURLEncoding.EncodeToString([]byte(urn))
    
    return base64URN, nil
}

// インターフェースの実装を確認
var _ domain.APSObjectRepository = (*APSObjectRepository)(nil)

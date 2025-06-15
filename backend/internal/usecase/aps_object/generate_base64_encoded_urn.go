package aps_object

import (
    "encoding/base64"
    "fmt"
)

// GenerateBase64EncodedURN はオブジェクトIDからBase64エンコードされたURNを生成します
func (u *APSObjectUseCase) GenerateBase64EncodedURN(objectId string) (string, error) {
    // URN形式の文字列を作成
    urn := fmt.Sprintf("urn:adsk.objects:os.object:%s", objectId)
    
    // URL-safe Base64エンコード（パディングなし）を使用
    base64URN := base64.RawURLEncoding.EncodeToString([]byte(urn))
    
    return base64URN, nil
}
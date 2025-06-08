package domain

// @Description APSトークンレスポンス
type APSToken struct {
    AccessToken  string `json:"access_token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." description:"APSアクセストークン"`
    TokenType    string `json:"token_type" example:"Bearer" description:"トークンタイプ"`
    ExpiresIn    int    `json:"expires_in" example:"3599" description:"有効期限（秒）"`
    RefreshToken string `json:"refresh_token" example:"" description:"リフレッシュトークン（2-leggedでは使用しない）"`
}

type APSTokenRepository interface {
    GetToken() (*APSToken, error)
}
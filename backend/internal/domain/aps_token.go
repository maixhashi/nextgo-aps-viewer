package domain

type APSToken struct {
    AccessToken  string
    TokenType    string
    ExpiresIn    int
    RefreshToken string
}

type APSTokenRepository interface {
    GetToken(clientID string, clientSecret string, scope string) (*APSToken, error)
}
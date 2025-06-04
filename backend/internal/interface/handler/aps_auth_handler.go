package handler

import (
    "github.com/gin-gonic/gin"
    "github.com/maixhashi/nextgo-aps-viewer/internal/usecase"
)

type APSAuthHandler struct {
    apsUseCase   *usecase.APSAuthUseCase
    clientID     string
    clientSecret string
}

func NewAPSAuthHandler(apsUseCase *usecase.APSAuthUseCase, clientID, clientSecret string) *APSAuthHandler {
    return &APSAuthHandler{
        apsUseCase:   apsUseCase,
        clientID:     clientID,
        clientSecret: clientSecret,
    }
}

// TokenResponse トークンレスポンス構造体
type TokenResponse struct {
    AccessToken string `json:"access_token"`
    ExpiresIn   int    `json:"expires_in"`
    TokenType   string `json:"token_type"`
}

// @Summary トークン取得
// @Description APS サービス用の認証トークンを取得
// @Tags 認証
// @Accept json
// @Produce json
// @Success 200 {object} TokenResponse
// @Router /auth/token [get]
func (h *APSAuthHandler) GetToken(c *gin.Context) {
    token, err := h.apsUseCase.GetToken(h.clientID, h.clientSecret, "data:read")
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, token)
}
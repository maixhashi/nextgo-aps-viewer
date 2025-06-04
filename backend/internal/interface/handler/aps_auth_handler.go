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

// GetToken handles the token request
func (h *APSAuthHandler) GetToken(c *gin.Context) {
    token, err := h.apsUseCase.GetToken(h.clientID, h.clientSecret, "data:read")
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, token)
}
package handler

import (
    "encoding/json"
    "net/http"
    "github.com/maixhashi/nextgo-aps-viewer/internal/usecase"
)

type APSAuthHandler struct {
    authUseCase  *usecase.APSAuthUseCase
    clientID     string
    clientSecret string
}

func NewAPSAuthHandler(useCase *usecase.APSAuthUseCase, clientID, clientSecret string) *APSAuthHandler {
    return &APSAuthHandler{
        authUseCase:  useCase,
        clientID:     clientID,
        clientSecret: clientSecret,
    }
}

func (h *APSAuthHandler) HandleGetToken(w http.ResponseWriter, r *http.Request) {
    token, err := h.authUseCase.GetAuthToken(h.clientID, h.clientSecret)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(token)
}
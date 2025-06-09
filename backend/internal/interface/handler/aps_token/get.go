package aps_token

import (
    "encoding/json"
    "net/http"
)

// @Summary APSトークン取得
// @Description 2-legged認証でAPSアクセストークンを取得します
// @Tags APS Token
// @Accept json
// @Produce json
// @Success 200 {object} domain.APSToken
// @Failure 500 {object} map[string]string
// @Router /api/v1/aps/token [post]
func (h *APSTokenHandler) GetToken(w http.ResponseWriter, r *http.Request) {
    token, err := h.tokenUseCase.GetToken()
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(token)
}
package aps_object

import (
    "encoding/json"
    "net/http"
    "github.com/gorilla/mux"
)

// @Summary 翻訳ジョブのステータス確認
// @Description 翻訳ジョブの進捗状況を確認します
// @Tags APS Object
// @Accept json
// @Produce json
// @Param urn path string true "Base64エンコードされたURN"
// @Success 200 {object} domain.TranslationStatus
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/aps/objects/{urn}/status [get]
func (h *APSObjectHandler) TrackTranslationJobStatus(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    urn := vars["urn"]

    status, err := h.objectUseCase.TrackTranslationJobStatus(urn)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(status)
}
package aps_bucket

import (
    "encoding/json"
    "net/http"
    "github.com/gorilla/mux"
)

// @Summary APSバケット詳細取得
// @Description 指定されたバケットの詳細情報を取得します
// @Tags APS Bucket
// @Accept json
// @Produce json
// @Param bucketKey path string true "バケットキー"
// @Success 200 {object} domain.APSBucketDetail
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/aps/buckets/{bucketKey}/details [get]
func (h *APSBucketHandler) GetBucketDetail(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    bucketKey := vars["bucketKey"]

    detail, err := h.bucketUseCase.GetBucketDetail(bucketKey)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(detail)
}
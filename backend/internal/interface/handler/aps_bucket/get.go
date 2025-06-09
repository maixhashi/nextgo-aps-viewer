package aps_bucket

import (
    "encoding/json"
    "net/http"
)

// @Summary Get buckets list
// @Description Get list of all buckets
// @Tags APS Bucket
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {array} domain.APSBucket
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Router /api/v1/aps/buckets [get]
func (h *APSBucketHandler) GetBuckets(w http.ResponseWriter, r *http.Request) {
    bucketsResp, err := h.bucketUseCase.GetBuckets(r.Context())
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(bucketsResp)
}
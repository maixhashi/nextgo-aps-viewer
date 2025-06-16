package aps_bucket

import (
    "encoding/json"
    "net/http"
)

// @Summary APSバケット作成
// @Description 新しいAPSバケットを作成します
// @Tags APS Bucket
// @Accept json
// @Produce json
// @Success 200 {object} domain.APSBucket
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/aps/buckets [post]
func (h *APSBucketHandler) CreateBucket(w http.ResponseWriter, r *http.Request) {
    bucket, err := h.bucketUseCase.CreateBucket()
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(bucket)
}
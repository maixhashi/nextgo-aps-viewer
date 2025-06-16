package aps_bucket

import (
    "net/http"
    "github.com/gorilla/mux"
)

// @Summary APSバケット削除
// @Description 指定されたバケットを削除します
// @Tags APS Bucket
// @Accept json
// @Produce json
// @Param bucketKey path string true "バケットキー"
// @Success 200 
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/aps/buckets/{bucketKey} [delete]
func (h *APSBucketHandler) DeleteBucket(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    bucketKey := vars["bucketKey"]

    if err := h.bucketUseCase.DeleteBucket(bucketKey); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
}
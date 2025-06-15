package aps_object

import (
    "encoding/json"
    "net/http"
    "github.com/gorilla/mux"
)

// @Summary APSオブジェクトの作成完了
// @Description S3へアップロードしたオブジェクトの作成を完了します
// @Tags APS Object
// @Accept json
// @Produce json
// @Param bucketKey path string true "バケットキー"
// @Param objectKey path string true "オブジェクトキー"
// @Param uploadKey body string true "アップロードキー"
// @Success 200 {object} domain.APSObject
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/aps/buckets/{bucketKey}/objects/{objectKey}/signeds3upload [post]
func (h *APSObjectHandler) CreateObject(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    bucketKey := vars["bucketKey"]
    objectKey := vars["objectKey"]

    var reqBody struct {
        UploadKey string `json:"uploadKey"`
    }
    if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
        http.Error(w, "invalid request body", http.StatusBadRequest)
        return
    }

    apsObject, err := h.objectUseCase.CreateObject(bucketKey, objectKey, reqBody.UploadKey)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(apsObject)
}
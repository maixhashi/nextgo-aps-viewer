package aps_object

import (
    "encoding/json"
    "net/http"
    "github.com/gorilla/mux"
)

// @Summary APSオブジェクトの翻訳ジョブ作成
// @Description オブジェクトの翻訳ジョブを作成します
// @Tags APS Object
// @Accept json
// @Produce json
// @Param objectId path string true "オブジェクトID"
// @Param objectKey path string true "オブジェクトキー"
// @Success 200 {object} domain.TranslateJobResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/aps/objects/{objectId}/translate [post]
func (h *APSObjectHandler) TranslateObject(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    objectId := vars["objectId"]
    objectKey := vars["objectKey"]

    // Base64エンコードされたURNを生成
    base64URN, err := h.objectUseCase.GenerateBase64EncodedURN(objectId)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // 翻訳ジョブを作成
    response, err := h.objectUseCase.TranslateObject(base64URN, objectKey)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}
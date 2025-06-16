package aps_object

import (
    "encoding/json"
    "net/http"
    "github.com/gorilla/mux"
)

// @Summary オブジェクトURNのBase64エンコード
// @Description オブジェクトIDをBase64エンコードしたURNを生成します
// @Tags APS Object
// @Accept json
// @Produce json
// @Param objectId path string true "オブジェクトID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/aps/objects/{objectId}/base64urn [get]
func (h *APSObjectHandler) GenerateBase64EncodedURN(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    objectId := vars["objectId"]
    
    base64URN, err := h.objectUseCase.GenerateBase64EncodedURN(objectId)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    response := map[string]string{
        "base64EncodedURN": base64URN,
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}
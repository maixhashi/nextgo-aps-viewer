package handler

import (
    "github.com/gin-gonic/gin"
    "github.com/maixhashi/nextgo-aps-viewer/internal/usecase"
)

type APSObjectHandler struct {
    objectUseCase *usecase.APSObjectUseCase
}

func NewAPSObjectHandler(objectUseCase *usecase.APSObjectUseCase) *APSObjectHandler {
    return &APSObjectHandler{
        objectUseCase: objectUseCase,
    }
}

// @Summary S3署名付きURLの取得
// @Description オブジェクトアップロード用のS3署名付きURLを取得
// @Tags オブジェクト
// @Param bucketKey path string true "Bucket Key"
// @Param objectKey query string true "Object Key"
// @Produce json
// @Success 200 {object} domain.Object
// @Router /buckets/{bucketKey}/objects/signeds3upload [get]
func (h *APSObjectHandler) GetSignedUrl(c *gin.Context) {
    bucketKey := c.Param("bucketKey")
    
    // ファイルを取得
    file, err := c.FormFile("file")
    if err != nil {
        c.JSON(400, gin.H{"error": "File is required"})
        return
    }

    // ファイル名をobject_keyとして使用
    objectKey := file.Filename

    object, err := h.objectUseCase.GetSignedUrl(bucketKey, objectKey)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, object)
}
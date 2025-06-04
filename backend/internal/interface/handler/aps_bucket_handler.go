package handler

import (
    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
    "github.com/maixhashi/nextgo-aps-viewer/internal/usecase"
)

type APSBucketHandler struct {
    bucketUseCase *usecase.APSBucketUseCase
}

func NewAPSBucketHandler(bucketUseCase *usecase.APSBucketUseCase) *APSBucketHandler {
    return &APSBucketHandler{
        bucketUseCase: bucketUseCase,
    }
}

// @Summary バケット作成
// @Description 新規バケットを作成
// @Tags バケット
// @Accept json
// @Produce json
// @Success 200 {object} BucketResponse
// @Router /buckets [post]
func (h *APSBucketHandler) CreateBucket(c *gin.Context) {
    bucketKey := "mybucket-" + generateUniqueID()
    bucket, err := h.bucketUseCase.CreateBucket(bucketKey)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, bucket)
}

// @Summary バケット一覧取得
// @Description バケット一覧を取得
// @Tags バケット
// @Produce json
// @Success 200 {array} domain.Bucket
// @Router /buckets [get]
func (h *APSBucketHandler) GetBuckets(c *gin.Context) {
    buckets, err := h.bucketUseCase.GetBuckets()
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, buckets)
}

// @Summary バケット削除
// @Description バケットを削除
// @Tags バケット
// @Param bucketKey path string true "Bucket Key"
// @Success 200 {object} string
// @Router /buckets/{bucketKey} [delete]
func (h *APSBucketHandler) DeleteBucket(c *gin.Context) {
    bucketKey := c.Param("bucketKey")
    if err := h.bucketUseCase.DeleteBucket(bucketKey); err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, gin.H{"message": "Bucket deleted successfully"})
}

// BucketResponse バケット情報のレスポンス構造体
type BucketResponse struct {
    Name         string    `json:"name"`
    CreatedDate  string    `json:"created_date"`
    PolicyKey    string    `json:"policy_key"`
}

func generateUniqueID() string {
    return uuid.New().String()
}
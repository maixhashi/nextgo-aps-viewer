package router

import (
	"github.com/gin-gonic/gin"
	"github.com/maixhashi/nextgo-aps-viewer/internal/interface/handler"
)

type APSRouter struct {
	apsHandler    *handler.APSAuthHandler
	bucketHandler *handler.APSBucketHandler
	objectHandler *handler.APSObjectHandler
}

func NewAPSRouter(apsHandler *handler.APSAuthHandler, bucketHandler *handler.APSBucketHandler, objectHandler *handler.APSObjectHandler) *APSRouter {
	return &APSRouter{
		apsHandler:    apsHandler,
		bucketHandler: bucketHandler,
		objectHandler: objectHandler,
	}
}

func (r *APSRouter) SetupRoutes(rg *gin.RouterGroup) {

	aps := rg.Group("/aps")
	{
		aps.POST("/token", r.apsHandler.GetToken)
		aps.POST("/buckets", r.bucketHandler.CreateBucket)
		aps.GET("/buckets", r.bucketHandler.GetBuckets)
		aps.GET("/buckets/:bucketKey", r.bucketHandler.GetBucketDetails)
		aps.DELETE("/buckets/:bucketKey", r.bucketHandler.DeleteBucket)
		aps.GET("/buckets/:bucketKey/objects/signeds3upload", r.objectHandler.GetSignedUrl)
	}
}
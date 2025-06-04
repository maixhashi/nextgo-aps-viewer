package router

import (
	"github.com/gin-gonic/gin"
	"github.com/maixhashi/nextgo-aps-viewer/internal/interface/handler"
)

type APSRouter struct {
	apsHandler *handler.APSAuthHandler
}

func NewAPSRouter(apsHandler *handler.APSAuthHandler) *APSRouter {
	return &APSRouter{
		apsHandler: apsHandler,
	}
}

func (r *APSRouter) SetupRoutes(rg *gin.RouterGroup) {
	aps := rg.Group("/aps")
	{
		aps.POST("/token", r.apsHandler.GetToken)
		// Add other APS-related routes here
	}
}
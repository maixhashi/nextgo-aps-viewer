package router

import (
	"net/http"
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

func (r *APSRouter) Setup() {
	http.HandleFunc("/api/auth/token", r.apsHandler.HandleGetToken)
	// APS関連の他のエンドポイントをここに追加
}
package router

import (
    "github.com/gorilla/mux"
    "github.com/swaggo/http-swagger"
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/interface/handler/aps_token"
)

// @title APS Viewer API
// @version 1.0
// @description APS (Autodesk Platform Services) トークン管理API
// @host localhost:8080

func RegisterAPSTokenRoutes(r *mux.Router, h *aps_token.APSTokenHandler) {
    // @Summary APSトークン取得
    // @Description 2-legged認証でAPSアクセストークンを取得
    // @Tags token
    // @Accept x-www-form-urlencoded
    // @Produce json
    // @Success 200 {object} domain.APSToken
    // @Failure 400 {object} string "不正なリクエスト"
    // @Failure 500 {object} string "サーバーエラー"
    // @Router /api/v1/aps/token [post]
    r.HandleFunc("/api/v1/aps/token", h.GetToken).Methods("POST")
    
    // Swagger routes
    r.PathPrefix("/swagger/").Handler(httpSwagger.Handler(
        httpSwagger.URL("/swagger/doc.json"),
        httpSwagger.DeepLinking(true),
    ))
}
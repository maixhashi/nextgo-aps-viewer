package router

import (
    "github.com/gorilla/mux"
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/infrastructure/aps"
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/interface/handler"
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/usecase"
)

func NewRouter() *mux.Router {
    r := mux.NewRouter()
    
    // リポジトリの初期化
    apsTokenRepo := aps.NewAPSTokenRepository()
    
    // ユースケースの初期化
    apsTokenUseCase := usecase.NewAPSTokenUseCase(apsTokenRepo)
    
    // ハンドラーの初期化
    apsTokenHandler := handler.NewAPSTokenHandler(apsTokenUseCase)
    
    // ルートの登録
    RegisterAPSTokenRoutes(r, apsTokenHandler)
    
    return r
}
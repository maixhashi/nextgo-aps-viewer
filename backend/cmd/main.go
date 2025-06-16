package main

import (
    "log"
    "net/http"
    "os"

    "github.com/gorilla/handlers"
    "github.com/joho/godotenv"
    _ "github.com/maixhashi/nextgo-aps-viewer/backend/docs" // Swaggerドキュメントのインポート
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/interface/router"
)

// @title APS Viewer API
// @version 1.0
// @description APS Token Management API
// @host localhost:8080
func main() {
    // 環境変数の読み込み
    if err := godotenv.Load(); err != nil {
        log.Fatal("Error loading .env file")
    }

    // ルーターの初期化
    r := router.NewRouter()

    // CORS設定
    corsOrigins := handlers.AllowedOrigins([]string{"*"})
    corsHeaders := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"})
    corsMethods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
    
    // サーバーの起動
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }
    
    log.Printf("Server starting on port %s", port)
    log.Fatal(http.ListenAndServe(":"+port, handlers.CORS(corsOrigins, corsHeaders, corsMethods)(r)))
}

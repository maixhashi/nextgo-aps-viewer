package main

import (
    "log"
    "net/http"
    "os"
    "github.com/joho/godotenv"
    "github.com/maixhashi/nextgo-aps-viewer/internal/infrastructure/aps"
    "github.com/maixhashi/nextgo-aps-viewer/internal/interface/handler"
    "github.com/maixhashi/nextgo-aps-viewer/internal/usecase"
)

func main() {
    // .envファイルの読み込み
    if err := godotenv.Load(); err != nil {
        log.Fatal("Error loading .env file")
    }

    // 環境変数の取得
    clientID := os.Getenv("APS_CLIENT_ID")
    clientSecret := os.Getenv("APS_CLIENT_SECRET")

    // 依存関係の注入
    apsRepo := aps.NewAPSTokenRepository()
    apsUseCase := usecase.NewAPSAuthUseCase(apsRepo)
    apsHandler := handler.NewAPSAuthHandler(apsUseCase, clientID, clientSecret)

    // ルーティング設定
    http.HandleFunc("/api/auth/token", apsHandler.HandleGetToken)

    // サーバー起動
    log.Println("Server starting on :8080")
    if err := http.ListenAndServe(":8080", nil); err != nil {
        log.Fatal(err)
    }
}
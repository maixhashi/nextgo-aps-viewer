package main

import (
    "log"
    "os"
    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    "github.com/swaggo/gin-swagger"
    "github.com/swaggo/files"
    _ "github.com/maixhashi/nextgo-aps-viewer/docs"
    "github.com/maixhashi/nextgo-aps-viewer/internal/infrastructure/aps"
    "github.com/maixhashi/nextgo-aps-viewer/internal/interface/handler"
    "github.com/maixhashi/nextgo-aps-viewer/internal/interface/router"
    "github.com/maixhashi/nextgo-aps-viewer/internal/usecase"
)

// @title           Nextgo APS Viewer API
// @version         1.0
// @description     API for APS Viewer application
// @host           localhost:8080
// @BasePath       /api/v1
func main() {
    if err := godotenv.Load(); err != nil {
        log.Fatal("Error loading .env file")
    }

    clientID := os.Getenv("APS_CLIENT_ID")
    clientSecret := os.Getenv("APS_CLIENT_SECRET")

    // Initialize Gin
    r := gin.Default()

    // Swagger documentation endpoint
    r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

    // Dependencies
    apsRepo := aps.NewAPSTokenRepository()
    apsUseCase := usecase.NewAPSAuthUseCase(apsRepo)
    apsHandler := handler.NewAPSAuthHandler(apsUseCase, clientID, clientSecret)
    
    // Setup routes
    api := r.Group("/api/v1")
    apsRouter := router.NewAPSRouter(apsHandler)
    apsRouter.SetupRoutes(api)

    log.Println("Server starting on :8080")
    if err := r.Run(":8080"); err != nil {
        log.Fatal(err)
    }
}
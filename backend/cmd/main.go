package main

import (
    "log"
    "os"
    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
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

    // Add CORS middleware
    r.Use(cors.Default())

    // Swagger documentation endpoint
    r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

    // Dependencies for Auth
    apsRepo := aps.NewAPSTokenRepository()
    apsUseCase := usecase.NewAPSAuthUseCase(apsRepo)
    apsHandler := handler.NewAPSAuthHandler(apsUseCase, clientID, clientSecret)
    
    // Dependencies for Bucket
    bucketRepo := aps.NewAPSBucketRepository()
    bucketUseCase := usecase.NewAPSBucketUseCase(bucketRepo, apsUseCase, clientID, clientSecret)
    bucketHandler := handler.NewAPSBucketHandler(bucketUseCase)

    // Dependencies for Object
    objectRepo := aps.NewAPSObjectRepository()
    objectUseCase := usecase.NewAPSObjectUseCase(objectRepo, apsUseCase, clientID, clientSecret)
    objectHandler := handler.NewAPSObjectHandler(objectUseCase)

    // Setup routes - パスの重複を修正
    api := r.Group("/api/v1")
    apsRouter := router.NewAPSRouter(apsHandler, bucketHandler, objectHandler)
    apsRouter.SetupRoutes(api)

    // デバッグ用にルートを表示
    routes := r.Routes()
    for _, route := range routes {
        log.Printf("Route: %s %s\n", route.Method, route.Path)
    }

    log.Println("Server starting on :8080")
    if err := r.Run(":8080"); err != nil {
        log.Fatal(err)
    }
}
package router

import (
    "github.com/gorilla/mux"
    aps_token_repo "github.com/maixhashi/nextgo-aps-viewer/backend/internal/infrastructure/aps/aps_token"
    aps_bucket_repo "github.com/maixhashi/nextgo-aps-viewer/backend/internal/infrastructure/aps/aps_bucket"
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/interface/handler/aps_token"
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/interface/handler/aps_bucket"
    token_usecase "github.com/maixhashi/nextgo-aps-viewer/backend/internal/usecase/aps_token"
    bucket_usecase "github.com/maixhashi/nextgo-aps-viewer/backend/internal/usecase/aps_bucket"
)

func NewRouter() *mux.Router {
    r := mux.NewRouter()
    
    // Initialize repositories
    apsTokenRepo := aps_token_repo.NewAPSTokenRepository()
    apsBucketRepo := aps_bucket_repo.NewAPSBucketRepository()
    
    // Initialize use cases
    apsTokenUseCase := token_usecase.NewAPSTokenUseCase(apsTokenRepo)
    apsBucketUseCase := bucket_usecase.NewAPSBucketUseCase(apsBucketRepo, apsTokenUseCase)
    
    // Initialize handlers
    apsTokenHandler := aps_token.NewAPSTokenHandler(apsTokenUseCase)
    apsBucketHandler := aps_bucket.NewAPSBucketHandler(apsBucketUseCase)
    
    // Register routes using modular router files
    RegisterAPSTokenRoutes(r, apsTokenHandler)
    RegisterAPSBucketRoutes(r, apsBucketHandler)
    
    return r
}
package router

import (
    "net/http"
    "github.com/gorilla/mux"
    aps_token_repo "github.com/maixhashi/nextgo-aps-viewer/backend/internal/infrastructure/aps/aps_token"
    aps_bucket_repo "github.com/maixhashi/nextgo-aps-viewer/backend/internal/infrastructure/aps/aps_bucket"
    aps_object_repo "github.com/maixhashi/nextgo-aps-viewer/backend/internal/infrastructure/aps/aps_object"
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/interface/handler/aps_token"
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/interface/handler/aps_bucket"
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/interface/handler/aps_object"
    token_usecase "github.com/maixhashi/nextgo-aps-viewer/backend/internal/usecase/aps_token"
    bucket_usecase "github.com/maixhashi/nextgo-aps-viewer/backend/internal/usecase/aps_bucket"
    object_usecase "github.com/maixhashi/nextgo-aps-viewer/backend/internal/usecase/aps_object"
)

func NewRouter() *mux.Router {
    r := mux.NewRouter()
    
    // Initialize HTTP client
    httpClient := &http.Client{}
    
    // Initialize repositories
    apsTokenRepo := aps_token_repo.NewAPSTokenRepository()
    apsBucketRepo := aps_bucket_repo.NewAPSBucketRepository(httpClient)
    apsObjectRepo := aps_object_repo.NewAPSObjectRepository(httpClient, apsTokenRepo)
    
    // Initialize use cases
    apsTokenUseCase := token_usecase.NewAPSTokenUseCase(apsTokenRepo)
    apsBucketUseCase := bucket_usecase.NewAPSBucketUseCase(apsBucketRepo, apsTokenUseCase)
    apsObjectUseCase := object_usecase.NewAPSObjectUseCase(apsObjectRepo)
    
    // Initialize handlers
    apsTokenHandler := aps_token.NewAPSTokenHandler(apsTokenUseCase)
    apsBucketHandler := aps_bucket.NewAPSBucketHandler(apsBucketUseCase)
    apsObjectHandler := aps_object.NewAPSObjectHandler(apsObjectUseCase)
    
    // Register routes using modular router files
    RegisterAPSTokenRoutes(r, apsTokenHandler)
    RegisterAPSBucketRoutes(r, apsBucketHandler)
    SetAPSObjectRoutes(r, apsObjectHandler)
    
    return r
}

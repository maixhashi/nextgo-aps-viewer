package router

import (
    "github.com/gorilla/mux"
    "github.com/maixhashi/nextgo-aps-viewer/backend/internal/interface/handler/aps_bucket"
)

func RegisterAPSBucketRoutes(r *mux.Router, h *aps_bucket.APSBucketHandler) {
    r.HandleFunc("/api/v1/aps/buckets", h.CreateBucket).Methods("POST")
    r.HandleFunc("/api/v1/aps/buckets", h.GetBuckets).Methods("GET")
    r.HandleFunc("/api/v1/aps/buckets/{bucketKey}/details", h.GetBucketDetail).Methods("GET")
    r.HandleFunc("/api/v1/aps/buckets/{bucketKey}", h.DeleteBucket).Methods("DELETE")
}
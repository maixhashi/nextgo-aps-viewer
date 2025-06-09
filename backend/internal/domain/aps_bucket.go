package domain

type APSBucket struct {
    BucketKey    string `json:"bucketKey"`
    CreatedDate  int64  `json:"createdDate"`
    PolicyKey    string `json:"policyKey"`
}

type BucketsResponse struct {
    Items []APSBucket `json:"items"`
    Next  string      `json:"next"`
}

type Permission struct {
    AuthId string `json:"authId"`
    Access string `json:"access"`
}

type APSBucketRepository interface {
    CreateBucket(token string) (*APSBucket, error)
    GetBuckets(token string) (*BucketsResponse, error)
}
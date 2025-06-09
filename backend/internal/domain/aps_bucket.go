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

// APSBucketDetail はバケットの詳細情報を表す構造体
type APSBucketDetail struct {
    BucketKey    string       `json:"bucketKey"`
    BucketOwner  string       `json:"bucketOwner"`
    CreatedDate  int64        `json:"createdDate"`
    Permissions  []Permission `json:"permissions"`
    PolicyKey    string       `json:"policyKey"`
}

// APSBucketRepository インターフェースに詳細取得メソッドを追加
type APSBucketRepository interface {
    CreateBucket(token string) (*APSBucket, error)
    GetBuckets(token string) (*BucketsResponse, error)
    GetBucketDetail(token string, bucketKey string) (*APSBucketDetail, error) // 追加
}
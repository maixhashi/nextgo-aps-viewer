package domain

type Bucket struct {
    BucketKey    string       `json:"bucketKey"`
    BucketOwner  string       `json:"bucketOwner"`
    CreatedDate  int64        `json:"createdDate"`
    Permissions  []Permission `json:"permissions"`
    PolicyKey    string       `json:"policyKey"`
}

type Permission struct {
    AuthId  string `json:"authId"`
    Access  string `json:"access"`
}

type BucketRepository interface {
    CreateBucket(accessToken string, bucketKey string, policyKey string) (*Bucket, error)
    GetBuckets(accessToken string) ([]Bucket, error)
    DeleteBucket(accessToken string, bucketKey string) error // 追加
}
package domain

type APSBucket struct {
    BucketKey    string       `json:"bucketKey"`
    BucketOwner  string       `json:"bucketOwner"`
    CreatedDate  int64        `json:"createdDate"`
    Permissions  []Permission `json:"permissions"`
    PolicyKey    string       `json:"policyKey"`
}

type Permission struct {
    AuthId string `json:"authId"`
    Access string `json:"access"`
}

type APSBucketRepository interface {
    CreateBucket(token string) (*APSBucket, error)
}
package domain

type Object struct {
    BucketKey        string   `json:"bucketKey"`
    ObjectKey        string   `json:"objectKey"`
    UploadKey        string   `json:"uploadKey"`
    UploadExpiration string   `json:"uploadExpiration"`
    UrlExpiration    string   `json:"urlExpiration"`
    Urls            []string  `json:"urls"`
}

type ObjectRepository interface {
    GetSignedUrl(accessToken string, bucketKey string, objectKey string) (*Object, error)
}
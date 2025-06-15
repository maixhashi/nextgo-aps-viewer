package domain

// APSObject はAutodesk Platform Servicesのオブジェクトを表す構造体
type APSObject struct {
	BucketKey       string   `json:"bucketKey"`
	ObjectId        string   `json:"objectId"`
	ObjectKey       string   `json:"objectKey"`
	Size            int64    `json:"size"`
	ContentType     string   `json:"contentType"`
	Location        string   `json:"location"`
	URLs            []string `json:"urls,omitempty"`
	UploadKey       string   `json:"uploadKey,omitempty"`
	UploadExpiration string  `json:"uploadExpiration,omitempty"`
	URLExpiration   string   `json:"urlExpiration,omitempty"`
}

// APSObjectRepository はAPSオブジェクトのリポジトリインターフェース
type APSObjectRepository interface {
	GetS3SignedURLs(bucketKey string, objectKey string, parts int) (*APSObject, error)
	PutS3SignedURLs(signedURL string, fileContent []byte) error
	CreateObject(bucketKey, objectKey, uploadKey string) (*APSObject, error)  // 追加
}

// APSObjectUseCase はAPSオブジェクトのユースケースインターフェース
type APSObjectUseCase interface {
	GetS3SignedURLs(bucketKey string, objectKey string, parts int) (*APSObject, error)
	PutS3SignedURLs(signedURL string, fileContent []byte) error
	CreateObject(bucketKey, objectKey, uploadKey string) (*APSObject, error)  // 追加
}

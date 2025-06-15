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
	GenerateBase64EncodedURN(objectId string) (string, error)
	// 新規追加
	TranslateObject(base64URN string, objectKey string) (*TranslateJobResponse, error)
}

// APSObjectUseCase はAPSオブジェクトのユースケースインターフェース
type APSObjectUseCase interface {
	GetS3SignedURLs(bucketKey string, objectKey string, parts int) (*APSObject, error)
	PutS3SignedURLs(signedURL string, fileContent []byte) error
	CreateObject(bucketKey, objectKey, uploadKey string) (*APSObject, error)  // 追加
	GenerateBase64EncodedURN(objectId string) (string, error)
	// 新規追加
	TranslateObject(base64URN string, objectKey string) (*TranslateJobResponse, error)
}

type TranslateJobResponse struct {
    Result      string `json:"result"`
    URN         string `json:"urn"`
    AcceptedJobs struct {
        Output struct {
            Formats []struct {
                Type  string   `json:"type"`
                Views []string `json:"views"`
            } `json:"formats"`
        } `json:"output"`
    } `json:"acceptedJobs"`
}

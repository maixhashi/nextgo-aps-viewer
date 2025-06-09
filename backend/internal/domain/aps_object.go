package domain

import "time"

// APSObject はAutodesk Platform Servicesのオブジェクトを表す構造体
type APSObject struct {
	UploadKey       string    `json:"uploadKey"`
	UploadExpiration time.Time `json:"uploadExpiration"`
	URLExpiration   time.Time `json:"urlExpiration"`
	URLs            []string  `json:"urls"`
}

// APSObjectRepository はAPSオブジェクトのリポジトリインターフェース
type APSObjectRepository interface {
	GetS3SignedURLs(bucketKey string, objectKey string, parts int) (*APSObject, error)
}

// APSObjectUseCase はAPSオブジェクトのユースケースインターフェース
type APSObjectUseCase interface {
	GetS3SignedURLs(bucketKey string, objectKey string, parts int) (*APSObject, error)
}

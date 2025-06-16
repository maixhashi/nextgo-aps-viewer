package aps_object

// PutS3SignedURLs はS3署名付きURLを使用してオブジェクトをアップロードします
func (u *APSObjectUseCase) PutS3SignedURLs(signedURL string, fileContent []byte) error {
	// リポジトリ層に処理を委譲
	return u.objectRepo.PutS3SignedURLs(signedURL, fileContent)
}

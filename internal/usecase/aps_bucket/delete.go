package aps_bucket

func (u *APSBucketUseCase) DeleteBucket(bucketKey string) error {
    token, err := u.tokenUseCase.GetToken()
    if err != nil {
        return err
    }

    return u.bucketRepo.DeleteBucket(token.AccessToken, bucketKey)
}
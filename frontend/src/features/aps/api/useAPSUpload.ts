import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api/apiClient';

interface UploadAPSObjectResponse {
  object: {
    objectId: string;
    objectKey: string;
    size: number;
    location: string;
  };
  base64EncodedURN: string;
  translateJob: {
    result: string;
  };
  translationStatus: {
    status: string;
    progress: string;
  };
}

export const useAPSUpload = () => {
  return useMutation({
    mutationFn: async ({ file, bucketKey }: { file: File; bucketKey: string }) => {
      const formData = new FormData();
      formData.append('file', file);

      // FormDataを使用する場合、apiClientの実装を修正
      // fetchAPIを直接使用して、Content-Typeヘッダーを自動設定させる
      const url = `http://localhost:8080/api/v1/aps/buckets/${bucketKey}/objects/upload`;
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // Content-Typeヘッダーは自動設定されるので指定しない
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API リクエストエラー: ${response.status} ${response.statusText} - ${
            JSON.stringify(errorData)
          }`
        );
      }
      
      return await response.json();
    },
  });
};

// バケット作成用のAPI
interface CreateBucketResponse {
  bucketKey: string;
  bucketOwner: string;
  createdDate: number;
  permissions: Array<{
    authId: string;
    access: string;
  }>;
  policyKey: string;
}

export const useCreateBucket = () => {
  return useMutation({
    mutationFn: async ({ bucketKey, policyKey = 'transient' }: { bucketKey: string; policyKey?: string }) => {
      const url = `http://localhost:8080/api/v1/aps/buckets`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bucketKey,
          policyKey,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API リクエストエラー: ${response.status} ${response.statusText} - ${
            JSON.stringify(errorData)
          }`
        );
      }
      
      return await response.json();
    },
  });
};

// バケット一覧取得用のAPI
interface GetBucketsResponse {
  items: Array<{
    bucketKey: string;
    createdDate: number;
    policyKey: string;
  }>;
}

export const useGetBuckets = () => {
  return useQuery<GetBucketsResponse>({
    queryKey: ['buckets'],
    queryFn: async () => {
      const url = `http://localhost:8080/api/v1/aps/buckets`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API リクエストエラー: ${response.status} ${response.statusText} - ${
            JSON.stringify(errorData)
          }`
        );
      }
      
      return await response.json();
    },
  });
};

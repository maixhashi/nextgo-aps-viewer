import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api/apiClient';

// APIレスポンスの型定義
interface APSTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// キャッシュキー
const APS_TOKEN_QUERY_KEY = ['aps', 'token'];

/**
 * APSトークンを取得するためのカスタムフック
 */
export function useAPSToken() {
  return useQuery({
    queryKey: APS_TOKEN_QUERY_KEY,
    queryFn: async () => {
      const url = `http://localhost:8080/api/v1/aps/token`;
      
      const response = await fetch(url, {
        method: 'POST',
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
    // トークンの有効期限は通常3600秒（1時間）なので、
    // 50分（3000秒）経過したらリフェッチする
    staleTime: 50 * 60 * 1000,
    // エラー時は3回までリトライ
    retry: 3,
  });
}

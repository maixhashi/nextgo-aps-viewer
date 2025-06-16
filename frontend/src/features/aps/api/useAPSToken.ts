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
      return apiClient.get<APSTokenResponse>('/api/aps/token');
    },
    // トークンの有効期限は通常3600秒（1時間）なので、
    // 50分（3000秒）経過したらリフェッチする
    staleTime: 50 * 60 * 1000,
    // エラー時は3回までリトライ
    retry: 3,
  });
}

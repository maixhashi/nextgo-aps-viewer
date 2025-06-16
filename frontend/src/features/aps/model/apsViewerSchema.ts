import { z } from 'zod';

// APSビューワーの設定スキーマ
export const apsConfigSchema = z.object({
  FORGE_ACCESS_TOKEN: z.string().min(1, {
    message: 'アクセストークンは必須です',
  }),
  FORGE_MODEL_URN: z.string().min(1, {
    message: 'モデルURNは必須です',
  }),
});

// 型定義のエクスポート
export type APSConfig = z.infer<typeof apsConfigSchema>;

// APSトークンレスポンスのスキーマ
export const apsTokenSchema = z.object({
  access_token: z.string().min(1, {
    message: 'アクセストークンは必須です',
  }),
  token_type: z.string(),
  expires_in: z.number().positive({
    message: '有効期限は正の数である必要があります',
  }),
});

// 型定義のエクスポート
export type APSToken = z.infer<typeof apsTokenSchema>;

// エラーレスポンスのスキーマ
export const errorResponseSchema = z.object({
  error: z.string(),
});

// 型定義のエクスポート
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

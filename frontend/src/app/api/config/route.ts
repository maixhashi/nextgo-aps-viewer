import { NextResponse } from 'next/server';
import { apsConfigSchema, apsTokenSchema, errorResponseSchema } from '@/features/aps/model/apsViewerSchema';
import { API_BASE_URL } from '@/shared/lib/api/apiClient';

export async function GET() {
  try {
    // バックエンドAPIからトークンを取得
    const response = await fetch(`${API_BASE_URL}/api/v1/aps/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`バックエンドAPIからのトークン取得に失敗しました: ${response.status}`);
    }

    const tokenData = await response.json();
    
    // トークンデータのバリデーション
    const validatedToken = apsTokenSchema.parse(tokenData);

    // URNの取得（実際の実装ではバックエンドから取得するか、環境変数から取得する）
    const urn = process.env.FORGE_MODEL_URN || '';
    
    // 設定データの作成とバリデーション
    const config = apsConfigSchema.parse({
      FORGE_ACCESS_TOKEN: validatedToken.access_token,
      FORGE_MODEL_URN: urn,
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error('設定の取得中にエラーが発生しました:', error);
    
    // エラーレスポンスの作成
    const errorResponse = errorResponseSchema.parse({
      error: error instanceof Error 
        ? error.message 
        : '設定の取得中に不明なエラーが発生しました'
    });
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

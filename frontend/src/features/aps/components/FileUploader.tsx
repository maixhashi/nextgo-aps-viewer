'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useAPSViewerStore } from '@/store/apsViewerStore';
import { useAPSUpload, useCreateBucket, useGetBuckets } from '../api/useAPSUpload';
import { useAPSToken } from '../api/useAPSToken';

export function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [customBucketKey, setCustomBucketKey] = useState<string>('');
  const [isCreatingBucket, setIsCreatingBucket] = useState<boolean>(false);
  const [selectedBucketKey, setSelectedBucketKey] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { setUrn, setAccessToken, setLoading, setError } = useAPSViewerStore();
  const { data: tokenData } = useAPSToken();
  const { data: bucketsData, refetch: refetchBuckets } = useGetBuckets();
  const uploadMutation = useAPSUpload();
  const createBucketMutation = useCreateBucket();

  // ファイル選択ハンドラー
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // バケット作成ハンドラー
  const handleCreateBucket = async () => {
    if (!customBucketKey) {
      setError('バケットキーを入力してください');
      return;
    }

    try {
      setLoading(true);
      await createBucketMutation.mutateAsync({ bucketKey: customBucketKey });
      setCustomBucketKey('');
      setIsCreatingBucket(false);
      refetchBuckets();
    } catch (error) {
      console.error('バケット作成エラー:', error);
      setError(`バケット作成に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // ファイルアップロードハンドラー
  const handleUpload = async () => {
    if (!file) {
      setError('ファイルを選択してください');
      return;
    }

    if (!selectedBucketKey) {
      setError('バケットを選択してください');
      return;
    }

    try {
      setLoading(true);
      const result = await uploadMutation.mutateAsync({
        file,
        bucketKey: selectedBucketKey,
      });

      // アップロード成功後、URNをセット
      if (result.base64EncodedURN) {
        // URNをセット（内部でアクセストークンも取得される）
        setUrn(result.base64EncodedURN);
        
        // トークンデータがあれば、アクセストークンも直接セット
        if (tokenData?.access_token) {
          setAccessToken(tokenData.access_token);
        }
        
        console.log('モデル変換ジョブが開始されました:', result);
      } else {
        setError('URNの取得に失敗しました');
      }
    } catch (error) {
      console.error('ファイルアップロードエラー:', error);
      setError(`ファイルアップロードに失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">ファイルアップロード</h2>
      
      {/* バケット選択/作成セクション */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">バケット選択</h3>
        
        {/* 既存バケット選択 */}
        <div className="mb-2">
          <select
            className="w-full p-2 border rounded"
            value={selectedBucketKey}
            onChange={(e) => setSelectedBucketKey(e.target.value)}
          >
            <option value="">バケットを選択</option>
            {bucketsData?.items?.map((bucket) => (
              <option key={bucket.bucketKey} value={bucket.bucketKey}>
                {bucket.bucketKey}
              </option>
            ))}
          </select>
        </div>
        
        {/* 新規バケット作成 */}
        {isCreatingBucket ? (
          <div className="flex space-x-2">
            <input
              type="text"
              className="flex-1 p-2 border rounded"
              placeholder="新しいバケットキー"
              value={customBucketKey}
              onChange={(e) => setCustomBucketKey(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleCreateBucket}
            >
              作成
            </button>
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              onClick={() => setIsCreatingBucket(false)}
            >
              キャンセル
            </button>
          </div>
        ) : (
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => setIsCreatingBucket(true)}
          >
            新規バケット作成
          </button>
        )}
      </div>
      
      {/* ファイル選択セクション */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">ファイル選択</h3>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept=".rvt,.rfa,.dwg,.nwd,.3dm,.ipt,.iam,.sldprt,.sldasm,.step,.stp,.stl,.obj"
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => fileInputRef.current?.click()}
          >
            ファイルを選択
          </button>
          <span className="text-gray-600">
            {file ? file.name : 'ファイルが選択されていません'}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          サポートされているファイル形式: .rvt, .rfa, .dwg, .nwd, .3dm, .ipt, .iam, .sldprt, .sldasm, .step, .stp, .stl, .obj
        </p>
      </div>
      
      {/* アップロードボタン */}
      <button
        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        onClick={handleUpload}
        disabled={!file || !selectedBucketKey || uploadMutation.isPending}
      >
        {uploadMutation.isPending ? 'アップロード中...' : 'アップロード'}
      </button>
      
      {/* エラーメッセージ */}
      {uploadMutation.error && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
          {uploadMutation.error instanceof Error
            ? uploadMutation.error.message
            : 'アップロード中にエラーが発生しました'}
        </div>
      )}
    </div>
  );
}

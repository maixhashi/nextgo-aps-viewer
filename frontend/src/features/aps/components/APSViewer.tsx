'use client';

import { useEffect, useRef, useState } from 'react';
import { useAPSViewerStore } from '@/store/apsViewerStore';

// Autodesk Viewerの型定義
declare global {
  interface Window {
    Autodesk: any;
  }
}

export function APSViewer() {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewerInstance, setViewerInstance] = useState<any>(null);
  const { urn, accessToken, isLoading, error, setError } = useAPSViewerStore();

  // Autodesk Viewerスクリプトが読み込まれたかどうかを確認する関数
  const checkAutodeskScriptLoaded = () => {
    return window.Autodesk && window.Autodesk.Viewing;
  };

  // ビューワーの初期化
  useEffect(() => {
    // URNとアクセストークンが取得できるまで待機
    if (!urn || !accessToken || !viewerRef.current) return;

    let viewer: any;
    let checkInterval: NodeJS.Timeout;

    const initializeViewer = () => {
      try {
        const options = {
          env: 'AutodeskProduction',
          accessToken: accessToken
        };

        // Autodesk Viewerの初期化
        console.log('Calling Autodesk.Viewing.Initializer');
        window.Autodesk.Viewing.Initializer(options, () => {
          console.log('Initializer callback executed');
          viewer = new window.Autodesk.Viewing.GuiViewer3D(viewerRef.current);
          viewer.start();
          setViewerInstance(viewer);

          // モデルの読み込み
          // URNが既に'urn:'で始まっているか確認
          const documentId = urn?.startsWith('urn:') ? urn : `urn:${urn}`;
          console.log('Loading document with ID:', documentId);
          window.Autodesk.Viewing.Document.load(
            documentId,
            (doc: any) => {
              // 成功時の処理
              console.log('Document loaded successfully');
              const defaultModel = doc.getRoot().getDefaultGeometry();
              console.log('Default geometry:', defaultModel);
              viewer.loadDocumentNode(doc, defaultModel);
            },
            (err: any) => {
              // エラー時の処理
              console.error('モデルの読み込みに失敗しました:', err);
              setError(`モデルの読み込みに失敗しました: ${err instanceof Error ? err.message : String(err)}`);
            }
          );
        });
      } catch (error) {
        console.error('ビューワーの初期化中にエラーが発生しました:', error);
        setError(error instanceof Error ? error.message : '不明なエラーが発生しました');
      }
    };

    try {
      console.log('Initializing viewer with URN:', urn);
      console.log('Access Token:', accessToken);
      
      // Autodesk Viewerスクリプトが読み込まれるまで待機
      if (!checkAutodeskScriptLoaded()) {
        console.log('Waiting for Autodesk Viewer script to load...');
        
        // スクリプトが読み込まれるまで定期的にチェック
        checkInterval = setInterval(() => {
          if (checkAutodeskScriptLoaded()) {
            console.log('Autodesk Viewer script loaded, initializing viewer...');
            clearInterval(checkInterval);
            initializeViewer();
          }
        }, 500);
        
        return () => {
          if (checkInterval) clearInterval(checkInterval);
        };
      } else {
        console.log('Autodesk Viewer script already loaded');
        initializeViewer();
      }
    } catch (error) {
      console.error('ビューワーの初期化中にエラーが発生しました:', error);
      setError(error instanceof Error ? error.message : '不明なエラーが発生しました');
    }

    // クリーンアップ関数
    return () => {
      if (viewer) {
        viewer.finish();
      }
    };
  }, [urn, accessToken, setError]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={viewerRef} 
        id="forgeViewer" 
        className="w-full h-full"
      />
      
      <div className="viewer-label absolute top-4 left-4 bg-black/70 text-white p-2 rounded z-10">
        Autodesk Platform Services Viewer
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
            <p>読み込み中...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white p-4">
          <div className="bg-red-800 p-4 rounded-md max-w-md">
            <h3 className="text-xl font-bold mb-2">エラーが発生しました</h3>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

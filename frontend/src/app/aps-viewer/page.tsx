"use client";

import { useEffect } from "react";
import { APSViewer } from "@/features/aps/components/APSViewer";
import { ThreeViewer } from "@/features/aps/components/ThreeViewer";
import { FileUploader } from "@/features/aps/components/FileUploader";
import { useAPSViewerStore } from "@/store/apsViewerStore";

export default function APSViewerPage() {
  const { fetchConfig } = useAPSViewerStore();

  // コンポーネントがマウントされたら設定を取得
  useEffect(() => {
    fetchConfig();

    // Autodesk Viewerのスクリプトを動的に読み込み
    const script = document.createElement('script');
    script.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.53.0/viewer3D.min.js';
    script.async = true;
    script.onload = () => console.log('Autodesk Viewer script loaded');
    script.onerror = (e) => console.error('Failed to load Autodesk Viewer script', e);
    document.body.appendChild(script);

    // スタイルシートを動的に読み込み
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.53.0/style.min.css';
    link.onload = () => console.log('Autodesk Viewer stylesheet loaded');
    link.onerror = () => console.error('Failed to load Autodesk Viewer stylesheet');
    document.head.appendChild(link);

    return () => {
      // クリーンアップ時にスクリプトとスタイルシートを削除
      const scripts = document.querySelectorAll('script[src*="viewer3D"]');
      scripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
      
      const links = document.querySelectorAll('link[href*="style.min.css"]');
      links.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [fetchConfig]);

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">APS Viewer - Model Comparison</h1>
        <p className="text-sm text-gray-300 mt-1">
          左: Autodesk Platform Services Viewer | 右: Three.js React Fiber (抽出メッシュ)
        </p>
      </header>
      
      {/* メインコンテンツ */}
      <div className="flex flex-1 overflow-hidden">
        {/* サイドバー - ファイルアップローダー */}
        <div className="w-80 p-4 overflow-y-auto bg-gray-100 border-r">
          <FileUploader />
          
          {/* 使用方法の説明 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">使用方法</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. ファイルをアップロードしてモデルを読み込み</li>
              <li>2. 左画面でモデルが表示されるのを確認</li>
              <li>3. "Extract Mesh" ボタンでメッシュデータを抽出</li>
              <li>4. 右画面でThree.jsによる描画を確認</li>
            </ol>
          </div>
          
          {/* 技術情報 */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">技術情報</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• APS Viewer: Autodesk Platform Services</div>
              <div>• Three.js: React Three Fiber</div>
              <div>• メッシュ抽出: BufferGeometry</div>
              <div>• レンダリング: WebGL</div>
            </div>
          </div>
        </div>
        
        {/* 比較表示エリア */}
        <div className="flex flex-1">
          {/* 左側: APS Viewer */}
          <div className="w-1/2 h-full border-r relative">
            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs z-20">
              Original (APS Viewer)
            </div>
            <APSViewer />
          </div>
          
          {/* 右側: Three.js React Fiber */}
          <div className="w-1/2 h-full relative">
            <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs z-20">
              Extracted Mesh (Three.js)
            </div>
            <ThreeViewer />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Head from "next/head";
import { APSViewer } from "@/features/aps/components/APSViewer";
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
      document.body.removeChild(script);
      document.head.removeChild(link);
    };
  }, [fetchConfig]);

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">APS Viewer</h1>
      </header>
      
      {/* メインコンテンツ */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* サイドバー - ファイルアップローダー */}
        <div className="w-full md:w-1/3 p-4 overflow-y-auto bg-gray-100">
          <FileUploader />
        </div>
        
        {/* ビューワーコンテナ */}
        <div className="w-full md:w-2/3 h-full">
          <APSViewer />
        </div>
      </div>
    </div>
  );
}

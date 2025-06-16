"use client";

import { useEffect } from "react";
import Head from "next/head";
import { APSViewer } from "@/features/aps/components/APSViewer";
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
    <>
      
      {/* ビューワーコンテナ */}
      <div className="w-full h-screen">
        <APSViewer />
      </div>
    </>
  );
}

'use client';

import { Canvas } from '@react-three/fiber';
import { useMeshDataManager } from './hooks/useMeshDataManager';
import { ExtractedMeshes } from './ExtractedMeshes';
import { UIOverlay } from './UIOverlay';
import { LoadingAndErrorStates } from './LoadingAndErrorStates';
import { DebugPanel } from './DebugPanel';
import { SceneLighting } from './SceneLighting';
import { SceneGrid } from './SceneGrid';
import { SceneControls } from './SceneControls';
import { CameraController } from './CameraController';
import { SelectedElementInfo } from './SelectedElementInfo';

export function ThreeViewer() {
  const {
    meshData,
    selectedElement,
    hoveredElement,
    isLoading,
    error,
    handleElementSelect,
    handleElementHover,
    handleElementUnhover,
    handlePropertyChange,
    handleDeselectElement,
    clearMeshData,
    handleBackgroundClick
  } = useMeshDataManager();

  // デバッグ用：selectedElementの状態を監視
  console.log('ThreeViewer render - selectedElement:', selectedElement);
  console.log('ThreeViewer render - selectedElement exists:', !!selectedElement);

  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* デバッグ用の固定表示 */}
      <div className="absolute top-0 right-0 bg-blue-500 text-white p-2 z-50 text-xs">
        Selected: {selectedElement ? `${selectedElement.dbId}` : 'None'}
      </div>

      {/* Three.js Canvas - 一時的にonClickを無効化 */}
      <Canvas
        camera={{ 
          position: [50, 50, 50], 
          fov: 60,
          near: 0.1,
          far: 10000
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true
        }}
        // onClick={handleBackgroundClick} // 一時的にコメントアウト
      >
        {/* シーンの基本要素 */}
        <SceneLighting />
        <SceneGrid />
        <SceneControls />

        {/* 抽出されたメッシュ（選択機能付き） */}
        {meshData.length > 0 && (
          <ExtractedMeshes 
            meshData={meshData}
            selectedElement={selectedElement}
            hoveredElement={hoveredElement}
            onSelect={handleElementSelect}
            onHover={handleElementHover}
            onUnhover={handleElementUnhover}
          />
        )}

        {/* カメラコントローラー */}
        <CameraController meshData={meshData} />
      </Canvas>

      {/* ドラッグ可能な要素情報パネル */}
      {selectedElement && (
        <SelectedElementInfo 
          selectedElement={selectedElement} 
          onClose={handleDeselectElement}
        />
      )}

      {/* UI オーバーレイ */}
      <UIOverlay
        meshData={meshData}
        selectedElement={selectedElement}
        hoveredElement={hoveredElement}
        onClearMeshData={clearMeshData}
        onDeselectElement={handleDeselectElement}
      />

      {/* ローディング・エラー状態 */}
      <LoadingAndErrorStates
        meshData={meshData}
        isLoading={isLoading}
        error={error}
        onErrorClose={() => {}}
      />

      {/* デバッグパネル */}
      <DebugPanel
        meshData={meshData}
        selectedElement={selectedElement}
      />
    </div>
  );
}
'use client';

import { Canvas } from '@react-three/fiber';
import { useMeshDataManager } from './hooks/useMeshDataManager';
import { ExtractedMeshes } from './ExtractedMeshes';
import { ElementInfoPanel } from './ElementInfoPanel';
import { UIOverlay } from './UIOverlay';
import { LoadingAndErrorStates } from './LoadingAndErrorStates';
import { DebugPanel } from './DebugPanel';
import { SceneLighting } from './SceneLighting';
import { SceneGrid } from './SceneGrid';
import { SceneControls } from './SceneControls';
import { CameraController } from './CameraController';

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

  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* Three.js Canvas */}
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
        onClick={handleBackgroundClick}
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

      {/* 要素情報パネル */}
      {selectedElement && (
        <ElementInfoPanel
          selectedElement={selectedElement}
          onClose={handleDeselectElement}
          onPropertyChange={handlePropertyChange}
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
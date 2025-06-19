'use client';

import { Canvas } from '@react-three/fiber';
import { useSnapshot } from 'valtio';
import { useMeshDataManager } from './hooks/useMeshDataManager';
import { ExtractedMeshes } from './ExtractedMeshes';
import { UIOverlay } from './UIOverlay';
import { LoadingAndErrorStates } from './LoadingAndErrorStates';
import { DebugPanel } from './DebugPanel';
import { SceneLighting } from './SceneLighting';
import { SceneGrid } from './SceneGrid';
import { SelectedElementInfo } from './SelectedElementInfo';
import { TransformControls } from './TransformControls';
import { transformState, setSelectedElement } from './store/transformStore';

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
    clearMeshData
  } = useMeshDataManager();

  const snap = useSnapshot(transformState);

  // Handle pointer missed - 参考例のパターン
  const handlePointerMissed = (event: any) => {
    if (event.type === 'click' && !snap.isTransforming) {
      console.log('Canvas pointer missed - deselecting');
      handleDeselectElement();
      setSelectedElement(null);
    }
  };

  console.log('ThreeViewer render:', {
    meshDataCount: meshData.length,
    selectedElement: selectedElement?.dbId,
    transformSelected: snap.selectedElement?.dbId,
    isTransforming: snap.isTransforming
  });

  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* デバッグ用の固定表示 */}
      <div className="absolute top-0 right-0 bg-blue-500 text-white p-2 z-50 text-xs">
        <div>Meshes: {meshData.length}</div>
        <div>Selected: {selectedElement ? `${selectedElement.dbId}` : 'None'}</div>
        <div>Transform Selected: {snap.selectedElement ? `${snap.selectedElement.dbId}` : 'None'}</div>
        <div>Mode: {snap.mode} (0=move, 1=rotate, 2=scale)</div>
        <div>Transforming: {snap.isTransforming ? 'Yes' : 'No'}</div>
      </div>

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
        onPointerMissed={handlePointerMissed}
      >
        {/* シーンの基本要素 */}
        <SceneLighting />
        <SceneGrid />

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

        {/* Transform Controls - 最後に配置して他のコンポーネントより優先 */}
        <TransformControls />
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

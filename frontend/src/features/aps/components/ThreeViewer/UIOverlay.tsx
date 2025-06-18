'use client';

import { ExtractedMeshData } from './types';

interface UIOverlayProps {
  meshData: ExtractedMeshData[];
  selectedElement: ExtractedMeshData | null;
  hoveredElement: ExtractedMeshData | null;
  onClearMeshData: () => void;
  onDeselectElement: () => void;
}

export function UIOverlay({
  meshData,
  selectedElement,
  hoveredElement,
  onClearMeshData,
  onDeselectElement
}: UIOverlayProps) {
  return (
    <>
      {/* メイン UI オーバーレイ */}
      <div className="absolute top-4 right-4 bg-black/70 text-white p-3 rounded z-10">
        <div className="text-sm mb-2">Three.js Interactive Viewer</div>
        <div className="text-xs space-y-1">
          <div>Meshes: {meshData.length}</div>
          <div>Selected: {selectedElement ? `${selectedElement.elementInfo?.name || `Element ${selectedElement.dbId}`}` : 'None'}</div>
          <div>Hovered: {hoveredElement ? `${hoveredElement.elementInfo?.name || `Element ${hoveredElement.dbId}`}` : 'None'}</div>
          {meshData.length > 0 && (
            <div className="space-y-1 mt-2">
              <button
                onClick={onClearMeshData}
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs block w-full"
              >
                Clear All
              </button>
              <button
                onClick={onDeselectElement}
                className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs block w-full"
                disabled={!selectedElement}
              >
                Deselect
              </button>
              <div className="text-gray-300 text-xs mt-2">
                <div>Click: Select element</div>
                <div>Hover: Highlight element</div>
                <div>Selected: Red color</div>
                <div>Hovered: Blue-green color</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 統計情報パネル */}
      {meshData.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-black/70 text-white p-3 rounded z-10 max-w-sm">
          <div className="text-sm mb-2">Element Statistics</div>
          <div className="text-xs space-y-1">
            <div>Total elements: {meshData.length}</div>
            <div>With element info: {meshData.filter(m => m.elementInfo).length}</div>
            <div>With properties: {meshData.filter(m => 
              m.elementInfo?.properties && Object.keys(m.elementInfo.properties).length > 0
            ).length}</div>
            <div>With bounding box: {meshData.filter(m => m.elementInfo?.boundingBox).length}</div>
            {selectedElement && (
              <div className="mt-2 p-2 bg-blue-900/50 rounded">
                <div className="font-semibold">Selected Element:</div>
                <div>ID: {selectedElement.dbId}</div>
                <div>Name: {selectedElement.elementInfo?.name || 'Unknown'}</div>
                <div>Category: {selectedElement.elementInfo?.category || 'Unknown'}</div>
                <div>Properties: {selectedElement.elementInfo?.properties ? 
                  Object.keys(selectedElement.elementInfo.properties).length : 0}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ヘルプパネル（選択された要素がある場合のみ表示） */}
      {selectedElement && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white p-3 rounded z-10 max-w-xs">
          <div className="text-sm mb-2">Selection Help</div>
          <div className="text-xs space-y-1">
            <div>• Click background to deselect</div>
            <div>• Edit properties in the info panel</div>
            <div>• Changes are saved automatically</div>
            <div>• Property changes trigger events</div>
            <div className="mt-2 p-2 bg-green-900/50 rounded">
              <div className="font-semibold">Current Selection:</div>
              <div className="truncate">{selectedElement.elementInfo?.name || `Element ${selectedElement.dbId}`}</div>
            </div>
          </div>
        </div>
      )}

      {/* キーボードショートカット表示 */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded text-xs z-10">
        <div className="flex items-center gap-4">
          <span>Mouse: Orbit</span>
          <span>Wheel: Zoom</span>
          <span>Right-click: Pan</span>
          <span>Click: Select Element</span>
        </div>
      </div>

      {/* パフォーマンス情報 */}
      {meshData.length > 50 && (
        <div className="absolute bottom-20 left-4 bg-yellow-900/70 text-white p-2 rounded text-xs z-10">
          <div className="font-semibold">Performance Notice</div>
          <div>Rendering {meshData.length} meshes</div>
          <div>Consider using LOD for better performance</div>
        </div>
      )}
    </>
  );
}
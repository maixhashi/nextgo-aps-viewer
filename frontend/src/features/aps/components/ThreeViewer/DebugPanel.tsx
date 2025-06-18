'use client';

import { ExtractedMeshData } from './types';

interface DebugPanelProps {
  meshData: ExtractedMeshData[];
  selectedElement: ExtractedMeshData | null;
}

export function DebugPanel({ meshData, selectedElement }: DebugPanelProps) {
  // 開発環境でのみ表示
  if (process.env.NODE_ENV !== 'development' || meshData.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-20 left-4 bg-black/70 text-white p-3 rounded z-10 max-w-sm text-xs">
      <div className="text-sm mb-2">Debug Info</div>
      <div className="space-y-1">
        <div>Rendered meshes: {meshData.length}</div>
        <div>With geometry: {meshData.filter(m => m.geometryData?.vertices?.length > 0).length}</div>
        <div>With indices: {meshData.filter(m => m.geometryData?.indices?.length > 0).length}</div>
        <div>With normals: {meshData.filter(m => m.geometryData?.normals?.length > 0).length}</div>
        <div>Total vertices: {meshData.reduce((sum, m) => sum + (m.geometryData?.vertexCount || 0), 0)}</div>
        <div>Total triangles: {meshData.reduce((sum, m) => {
          if (m.geometryData?.indices) {
            return sum + Math.floor(m.geometryData.indices.length / 3);
          }
          return sum + Math.floor((m.geometryData?.vertexCount || 0) / 3);
        }, 0)}</div>
        {selectedElement && (
          <div className="mt-2 p-2 bg-yellow-900/50 rounded">
            <div className="font-semibold">Selected Debug:</div>
            <div>FragId: {selectedElement.fragId}</div>
            <div>Vertices: {selectedElement.geometryData.vertexCount}</div>
            <div>Has Matrix: {!!selectedElement.matrixWorld}</div>
            <div>Has ElementInfo: {!!selectedElement.elementInfo}</div>
          </div>
        )}
      </div>
    </div>
  );
}
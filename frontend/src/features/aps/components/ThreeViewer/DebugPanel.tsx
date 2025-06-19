'use client';

interface DebugPanelProps {
  meshData: any[];
  selectedElement: any;
}

export function DebugPanel({ meshData, selectedElement }: DebugPanelProps) {
  // 開発環境でのみ表示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white p-3 rounded-lg text-xs z-30 max-w-md">
      <div className="font-semibold mb-2">Debug Info</div>
      <div className="space-y-1">
        <div>Total Meshes: {meshData.length}</div>
        <div>Selected ID: {selectedElement?.dbId || 'None'}</div>
        <div>Selected Fragment: {selectedElement?.fragId || 'None'}</div>
        {selectedElement && (
          <div>Has Element Info: {selectedElement.elementInfo ? 'Yes' : 'No'}</div>
        )}
      </div>
    </div>
  );
}
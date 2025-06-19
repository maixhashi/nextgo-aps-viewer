'use client';

import { useSnapshot } from 'valtio';
import { transformState, getCurrentTransformMode, cycleTransformMode, transformModes } from './store/transformStore';

interface UIOverlayProps {
  meshData: any[];
  selectedElement: any;
  hoveredElement: any;
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
  const snap = useSnapshot(transformState);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Top Left - Controls Info */}
      <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded-lg text-sm pointer-events-auto max-w-xs">
        <div className="space-y-2">
          <div className="font-semibold text-yellow-400">Basic Controls:</div>
          <div>• <span className="text-blue-300">Left Click</span>: Select element</div>
          <div>• <span className="text-blue-300">Right Click</span>: Cycle transform mode</div>
          <div>• <span className="text-blue-300">Mouse Wheel</span>: Zoom camera</div>
          <div>• <span className="text-blue-300">Middle Drag</span>: Pan camera</div>
          <div>• <span className="text-blue-300">Left Drag</span>: Rotate camera</div>
        </div>
        
        {snap.selectedElement && (
          <div className="mt-4 pt-3 border-t border-gray-600">
            <div className="font-semibold text-green-400">Transform Controls:</div>
            <div className="space-y-1 mt-2">
              <div>• <span className="text-orange-300">Drag Gizmo</span>: Transform element</div>
              <div>• <span className="text-orange-300">Red Arrow</span>: X-axis</div>
              <div>• <span className="text-orange-300">Green Arrow</span>: Y-axis</div>
              <div>• <span className="text-orange-300">Blue Arrow</span>: Z-axis</div>
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm">Mode:</span>
              <div className="flex gap-1">
                {transformModes.map((mode, index) => (
                  <button
                    key={mode}
                    onClick={() => {
                      while (snap.mode !== index) {
                        cycleTransformMode();
                      }
                    }}
                    className={`px-2 py-1 rounded text-xs capitalize ${
                      snap.mode === index 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Right - Stats */}
      <div className="absolute top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-sm pointer-events-auto">
        <div className="space-y-1">
          <div><span className="text-gray-400">Elements:</span> {meshData.length}</div>
          <div><span className="text-gray-400">Selected:</span> {selectedElement ? `${selectedElement.dbId}` : 'None'}</div>
          <div><span className="text-gray-400">Hovered:</span> {hoveredElement ? `${hoveredElement.dbId}` : 'None'}</div>
          {snap.isTransforming && (
            <div className="text-yellow-400 font-medium">🔄 Transforming...</div>
          )}
        </div>
      </div>

      {/* Bottom Left - Actions */}
      <div className="absolute bottom-4 left-4 space-y-2 pointer-events-auto">
        <button
          onClick={onClearMeshData}
          className="block px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
        >
          Clear All
        </button>
        
        {selectedElement && (
          <button
            onClick={onDeselectElement}
            className="block px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
          >
            Deselect
          </button>
        )}
      </div>

      {/* Transform Mode Indicator - Large */}
      {snap.selectedElement && (
        <div className="absolute bottom-4 right-4 bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-lg shadow-lg pointer-events-auto">
          <div className="text-center">
            <div className="text-xs opacity-75 uppercase tracking-wide">Transform Mode</div>
            <div className="text-2xl font-bold capitalize mt-1">{getCurrentTransformMode()}</div>
            <div className="text-xs opacity-75 mt-2">
              {snap.mode + 1} of {transformModes.length}
            </div>
            <div className="text-xs opacity-75 mt-1">
              Right-click element to cycle
            </div>
          </div>
        </div>
      )}

      {/* Selection Hint */}
      {!selectedElement && meshData.length > 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600/90 text-white p-4 rounded-lg text-center pointer-events-auto">
          <div className="text-lg font-semibold">Click an element to select</div>
          <div className="text-sm opacity-75 mt-1">
            {meshData.length} elements available
          </div>
        </div>
      )}
    </div>
  );
}
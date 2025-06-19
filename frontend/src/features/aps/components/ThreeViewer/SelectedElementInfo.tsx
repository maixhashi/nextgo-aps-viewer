'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { ExtractedMeshData } from './types';
import { transformState, getCurrentTransformMode, cycleTransformMode } from './store/transformStore';

interface SelectedElementInfoProps {
  selectedElement: ExtractedMeshData;
  onClose?: () => void;
}

export function SelectedElementInfo({ selectedElement, onClose }: SelectedElementInfoProps) {
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [previousPosition, setPreviousPosition] = useState({ x: 16, y: 16 });
  const panelRef = useRef<HTMLDivElement>(null);
  
  const snap = useSnapshot(transformState);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const dragHandle = target.closest('.drag-handle');
    const isButton = target.closest('.window-button');
    
    if (!dragHandle || isButton) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    
    e.preventDefault();
    e.stopPropagation();
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || isMaximized) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    const panel = panelRef.current;
    if (panel) {
      const rect = panel.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;

      const constrainedPosition = {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      };

      setPosition(constrainedPosition);
    }

    e.preventDefault();
  }, [isDragging, dragStart, isMaximized]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    setIsDragging(false);
    e.preventDefault();
  }, []);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized);
  }, [isMinimized]);

  const handleMaximize = useCallback(() => {
    if (isMaximized) {
      setPosition(previousPosition);
      setIsMaximized(false);
    } else {
      setPreviousPosition(position);
      setPosition({ x: 10, y: 10 });
      setIsMaximized(true);
    }
  }, [isMaximized, position, previousPosition]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.window-button')) return;
    handleMaximize();
  }, [handleMaximize]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!selectedElement) {
    return null;
  }

  const { dbId, fragId, elementInfo, transform } = selectedElement;

  const maxStyle = isMaximized ? {
    left: '10px',
    top: '10px',
    right: '10px',
    bottom: '10px',
    width: 'calc(100vw - 20px)',
    height: 'calc(100vh - 20px)',
    maxWidth: 'none',
    maxHeight: 'none'
  } : {
    left: `${position.x}px`,
    top: `${position.y}px`,
    maxHeight: '70vh',
    minWidth: '300px',
    maxWidth: '500px'
  };

  return (
    <div
      ref={panelRef}
      className={`absolute bg-white/95 backdrop-blur-sm rounded-lg shadow-lg z-50 ${
        isDragging ? 'shadow-2xl' : ''
      } ${isMaximized ? 'rounded-lg' : ''} transition-all duration-200 ${
        isMinimized ? 'h-12 overflow-hidden' : ''
      }`}
      style={maxStyle}
    >
      {/* macOSスタイルのヘッダー */}
      <div 
        className="drag-handle bg-gray-100 rounded-t-lg px-4 py-3 cursor-grab active:cursor-grabbing border-b select-none flex items-center justify-between"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          backgroundColor: isDragging ? '#e5e7eb' : '#f3f4f6'
        }}
      >
        <div className="flex space-x-2">
          <button
            className="window-button w-3 h-3 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center group transition-colors"
            onClick={handleClose}
            title="Close"
          >
            <span className="text-red-800 text-xs opacity-0 group-hover:opacity-100 font-bold leading-none">×</span>
          </button>
          <button
            className="window-button w-3 h-3 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center group transition-colors"
            onClick={handleMinimize}
            title="Minimize"
          >
            <span className="text-yellow-800 text-xs opacity-0 group-hover:opacity-100 font-bold leading-none">−</span>
            </button>
          <button
            className="window-button w-3 h-3 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center group transition-colors"
            onClick={handleMaximize}
            title="Maximize"
          >
            <span className="text-green-800 text-xs opacity-0 group-hover:opacity-100 font-bold leading-none">+</span>
          </button>
        </div>

        <h3 className="text-sm font-semibold text-gray-800 pointer-events-none flex-1 text-center">
          Selected Element
        </h3>

        <div className="w-16"></div>
      </div>

      {/* コンテンツ部分 */}
      {!isMinimized && (
        <div 
          className="p-4 overflow-y-auto" 
          style={{ 
            maxHeight: isMaximized ? 'calc(100vh - 100px)' : 'calc(70vh - 80px)' 
          }}
        >
          <div className="space-y-3">
            {/* 基本情報 */}
            <div className="border-b pb-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">DB ID:</span>
                  <span className="ml-2 text-gray-800">{dbId}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Frag ID:</span>
                  <span className="ml-2 text-gray-800">{fragId}</span>
                </div>
              </div>
            </div>

            {/* Transform Controls */}
            <div className="border-b pb-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-700">Transform Controls</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 capitalize">
                    Mode: {getCurrentTransformMode()}
                  </span>
                  <button
                    onClick={cycleTransformMode}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                  >
                    Switch
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Click and drag the gizmo to transform</div>
                <div>• Right-click element to cycle modes</div>
                <div>• Current: <span className="font-medium capitalize">{getCurrentTransformMode()}</span></div>
                {snap.isTransforming && (
                  <div className="text-blue-600 font-medium">🔄 Transforming...</div>
                )}
              </div>
            </div>

            {/* Transform Information */}
            {transform && (
              <div className="border-b pb-2">
                <h4 className="font-medium text-gray-700 mb-2">Current Transform</h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="font-medium text-gray-600">Position:</div>
                    <div className="text-gray-800">X: {transform.position.x.toFixed(2)}</div>
                    <div className="text-gray-800">Y: {transform.position.y.toFixed(2)}</div>
                    <div className="text-gray-800">Z: {transform.position.z.toFixed(2)}</div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div className="font-medium text-gray-600">Rotation:</div>
                    <div className="text-gray-800">X: {(transform.rotation.x * 180 / Math.PI).toFixed(1)}°</div>
                    <div className="text-gray-800">Y: {(transform.rotation.y * 180 / Math.PI).toFixed(1)}°</div>
                    <div className="text-gray-800">Z: {(transform.rotation.z * 180 / Math.PI).toFixed(1)}°</div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div className="font-medium text-gray-600">Scale:</div>
                    <div className="text-gray-800">X: {transform.scale.x.toFixed(2)}</div>
                    <div className="text-gray-800">Y: {transform.scale.y.toFixed(2)}</div>
                    <div className="text-gray-800">Z: {transform.scale.z.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 要素情報 */}
            {elementInfo && (
              <div className="space-y-2">
                {elementInfo.name && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-600">Name:</span>
                    <span className="ml-2 text-gray-800">{elementInfo.name}</span>
                  </div>
                )}
                
                {elementInfo.category && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-600">Category:</span>
                    <span className="ml-2 text-gray-800">{elementInfo.category}</span>
                  </div>
                )}

                {elementInfo.type && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-600">Type:</span>
                    <span className="ml-2 text-gray-800">{elementInfo.type}</span>
                  </div>
                )}
              </div>
            )}

            {/* プロパティ情報 */}
            {elementInfo?.properties && Object.keys(elementInfo.properties).length > 0 && (
              <div className="border-t pt-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-700">Properties</h4>
                  <span className="text-xs text-gray-500">
                    ({Object.keys(elementInfo.properties).length} items)
                  </span>
                </div>
                <div className="space-y-2 overflow-y-auto" style={{ maxHeight: isMaximized ? '400px' : '200px' }}>
                  {Object.entries(elementInfo.properties).map(([key, value]) => (
                    <div key={key} className="text-xs border-l-2 border-gray-200 pl-2">
                      <div className="font-medium text-gray-700 mb-1">{key}:</div>
                      <div className="ml-2">
                        {renderPropertyValue(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 統計情報 */}
            <div className="border-t pt-2 text-xs text-gray-500">
              <div>Has Element Info: {elementInfo ? 'Yes' : 'No'}</div>
              <div>Property Count: {elementInfo?.properties ? Object.keys(elementInfo.properties).length : 0}</div>
              <div>Has Bounding Box: {elementInfo?.boundingBox ? 'Yes' : 'No'}</div>
              <div>Has Transform: {transform ? 'Yes' : 'No'}</div>
              <div>Transform Mode: {getCurrentTransformMode()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// シンプルなプロパティ値レンダリング
function renderPropertyValue(value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-gray-400 italic">null</span>;
  }

  // オブジェクト型の場合（Autodesk Forgeのプロパティ形式）
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return (
      <span className="text-gray-800">
        {String(value.value)}
        {value.type && <span className="text-gray-500 ml-1">({value.type})</span>}
      </span>
    );
  }

  // プリミティブ値の場合
  return <span className="text-gray-800">{String(value)}</span>;
}

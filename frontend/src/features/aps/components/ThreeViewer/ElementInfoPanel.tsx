'use client';

import { useState } from 'react';
import { ElementInfoPanelProps } from './types';

export function ElementInfoPanel({ 
  selectedElement, 
  onClose, 
  onPropertyChange 
}: ElementInfoPanelProps) {
  const [editingProperty, setEditingProperty] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  if (!selectedElement) return null;

  const handleEdit = (propertyName: string, currentValue: any) => {
    setEditingProperty(propertyName);
    
    // 値の安全な抽出
    let editableValue = '';
    if (typeof currentValue === 'object' && currentValue !== null) {
      if (currentValue.value !== undefined) {
        editableValue = String(currentValue.value);
      } else {
        editableValue = JSON.stringify(currentValue);
      }
    } else {
      editableValue = String(currentValue);
    }
    
    setEditValue(editableValue);
  };

  const handleSave = () => {
    if (editingProperty) {
      onPropertyChange(editingProperty, editValue);
      setEditingProperty(null);
      setEditValue('');
    }
  };

  const handleCancel = () => {
    setEditingProperty(null);
    setEditValue('');
  };

  const formatValue = (value: any) => {
    if (typeof value === 'object' && value !== null) {
      // value.value が存在する場合
      if (value.value !== undefined) {
        const displayValue = String(value.value);
        const units = value.units ? String(value.units) : '';
        return `${displayValue} ${units}`.trim();
      }
      // value.value が存在しない場合、オブジェクト全体を文字列化
      return JSON.stringify(value);
    }
    return String(value);
  };

  const isEditableProperty = (propertyName: string, property: any) => {
    // 編集可能なプロパティの判定（安全な型チェック付き）
    const editableTypes = ['string', 'number', 'length', 'area', 'volume'];
    const editableNames = ['length', 'width', 'height', 'thickness', 'diameter', 'radius'];
    
    // property.type の安全なチェック
    if (typeof property === 'object' && property !== null && property.type) {
      const propertyType = typeof property.type === 'string' ? property.type : String(property.type);
      return editableTypes.includes(propertyType.toLowerCase());
    }
    
    // プロパティ名による判定
    const lowerPropertyName = propertyName.toLowerCase();
    return editableNames.some(name => lowerPropertyName.includes(name));
  };

  return (
    <div className="absolute top-4 left-4 bg-white shadow-lg rounded-lg p-4 max-w-md max-h-96 overflow-y-auto z-20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Element Information</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
      </div>

      {/* 基本情報 */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="font-semibold text-gray-600">DB ID:</div>
          <div className="text-gray-800">{selectedElement.dbId}</div>
          
          <div className="font-semibold text-gray-600">Fragment ID:</div>
          <div className="text-gray-800">{selectedElement.fragId}</div>
          
          {selectedElement.elementInfo?.name && (
            <>
              <div className="font-semibold text-gray-600">Name:</div>
              <div className="text-gray-800">{selectedElement.elementInfo.name}</div>
            </>
          )}
          
          {selectedElement.elementInfo?.category && (
            <>
              <div className="font-semibold text-gray-600">Category:</div>
              <div className="text-gray-800">{selectedElement.elementInfo.category}</div>
            </>
          )}
          
          {selectedElement.elementInfo?.type && (
            <>
              <div className="font-semibold text-gray-600">Type:</div>
              <div className="text-gray-800">{selectedElement.elementInfo.type}</div>
            </>
          )}
        </div>
      </div>

      {/* バウンディングボックス情報 */}
      {selectedElement.elementInfo?.boundingBox && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Dimensions</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-semibold text-gray-600">Size (X,Y,Z):</div>
            <div className="text-gray-800">
              {selectedElement.elementInfo.boundingBox.size.map(s => s.toFixed(2)).join(', ')}
            </div>
            
            <div className="font-semibold text-gray-600">Center:</div>
            <div className="text-gray-800">
              {selectedElement.elementInfo.boundingBox.center.map(c => c.toFixed(2)).join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* プロパティセクション */}
      {selectedElement.elementInfo?.properties && Object.keys(selectedElement.elementInfo.properties).length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Properties</h4>
          <div className="space-y-2">
            {Object.entries(selectedElement.elementInfo.properties).map(([key, value]) => {
              // 値の安全性チェック
              if (value === null || value === undefined) {
                return (
                  <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="font-medium text-gray-700 text-sm">{key}</div>
                      <div className="text-gray-600 text-sm">No value</div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="font-medium text-gray-700 text-sm">{key}</div>
                    {editingProperty === key ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          autoFocus
                        />
                        <button
                          onClick={handleSave}
                          className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="text-gray-600 text-sm">{formatValue(value)}</div>
                        {isEditableProperty(key, value) && (
                          <button
                            onClick={() => handleEdit(key, value)}
                            className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ジオメトリ情報 */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 mb-2">Geometry Info</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="font-semibold text-gray-600">Vertices:</div>
          <div className="text-gray-800">{selectedElement.geometryData.vertexCount}</div>
          
          <div className="font-semibold text-gray-600">Has Normals:</div>
          <div className="text-gray-800">{selectedElement.geometryData.normals ? 'Yes' : 'No'}</div>
          
          <div className="font-semibold text-gray-600">Has Indices:</div>
          <div className="text-gray-800">{selectedElement.geometryData.indices ? 'Yes' : 'No'}</div>
          
          {selectedElement.geometryData.indices && (
            <>
              <div className="font-semibold text-gray-600">Triangles:</div>
              <div className="text-gray-800">{Math.floor(selectedElement.geometryData.indices.length / 3)}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
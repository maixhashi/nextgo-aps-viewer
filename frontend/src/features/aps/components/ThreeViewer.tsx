'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';

// メッシュデータの型定義（拡張）
interface ExtractedMeshData {
  dbId: number;
  fragId: number;
  geometryData: {
    vertices: Float32Array;
    normals?: Float32Array;
    indices?: Uint32Array;
    vertexCount: number;
  };
  matrixWorld: number[];
  material?: any;
  elementInfo?: {
    name?: string;
    category?: string;
    type?: string;
    properties?: { [key: string]: any };
    boundingBox?: {
      min: number[];
      max: number[];
      center: number[];
      size: number[];
    };
  };
}

// 選択可能なメッシュコンポーネント（修正版）
function SelectableMesh({ 
  meshData, 
  isSelected, 
  isHovered,
  onSelect, 
  onHover,
  onUnhover 
}: {
  meshData: ExtractedMeshData;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (meshData: ExtractedMeshData) => void;
  onHover: (meshData: ExtractedMeshData) => void;
  onUnhover: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    const { geometryData, matrixWorld } = meshData;
    
    if (!geometryData || !geometryData.vertices || geometryData.vertices.length === 0) {
      console.warn(`No valid geometry data for mesh dbId: ${meshData.dbId}, fragId: ${meshData.fragId}`);
      return;
    }

    console.log(`Creating geometry for dbId: ${meshData.dbId}, fragId: ${meshData.fragId}`);
    console.log('Vertex count:', geometryData.vertexCount);
    console.log('Vertices length:', geometryData.vertices.length);
    console.log('Has indices:', !!geometryData.indices);
    console.log('Indices length:', geometryData.indices?.length || 0);

    // 既存のジオメトリを破棄
    if (geometry) {
      geometry.dispose();
    }

    // 新しいジオメトリを作成
    const newGeometry = new THREE.BufferGeometry();
    
    // 座標系変換
    const transformedVertices = new Float32Array(geometryData.vertices.length);
    for (let i = 0; i < geometryData.vertices.length; i += 3) {
      transformedVertices[i] = geometryData.vertices[i];
      transformedVertices[i + 1] = geometryData.vertices[i + 2];
      transformedVertices[i + 2] = -geometryData.vertices[i + 1];
    }
    
    newGeometry.setAttribute('position', new THREE.BufferAttribute(transformedVertices, 3));
    console.log('Set position attribute with', transformedVertices.length / 3, 'vertices');

    // 法線の処理
    if (geometryData.normals && geometryData.normals.length > 0) {
      const transformedNormals = new Float32Array(geometryData.normals.length);
      for (let i = 0; i < geometryData.normals.length; i += 3) {
        transformedNormals[i] = geometryData.normals[i];
        transformedNormals[i + 1] = geometryData.normals[i + 2];
        transformedNormals[i + 2] = -geometryData.normals[i + 1];
      }
      newGeometry.setAttribute('normal', new THREE.BufferAttribute(transformedNormals, 3));
      console.log('Set transformed normal attribute');
    } else {
      newGeometry.computeVertexNormals();
      console.log('Computed vertex normals');
    }

    // インデックスの処理
    if (geometryData.indices && geometryData.indices.length > 0) {
      newGeometry.setIndex(new THREE.BufferAttribute(geometryData.indices, 1));
      console.log('Set index attribute with', geometryData.indices.length / 3, 'triangles');
    }

    // バウンディングボックスとバウンディングスフィアを計算
    newGeometry.computeBoundingBox();
    newGeometry.computeBoundingSphere();

    // 変換行列を適用
    if (matrixWorld && Array.isArray(matrixWorld) && matrixWorld.length === 16) {
      const matrix = new THREE.Matrix4();
      matrix.fromArray(matrixWorld);
      newGeometry.applyMatrix4(matrix);
      console.log('Applied transformation matrix');
    }

    // ジオメトリの最終チェック
    const bbox = newGeometry.boundingBox;
    if (bbox) {
      const size = bbox.getSize(new THREE.Vector3());
      console.log(`Geometry bounding box size: ${size.x.toFixed(2)}, ${size.y.toFixed(2)}, ${size.z.toFixed(2)}`);
      
      // 非常に小さいジオメトリの警告
      if (size.length() < 0.001) {
        console.warn(`Very small geometry detected for mesh ${meshData.fragId}, size:`, size.length());
      }
    }

    setGeometry(newGeometry);

    // クリーンアップ
    return () => {
      if (newGeometry) {
        newGeometry.dispose();
      }
    };
  }, [meshData]);

  // 色の計算
  const getColor = () => {
    if (isSelected) return '#ff6b6b'; // 選択時は赤
    if (isHovered) return '#4ecdc4'; // ホバー時は青緑
    const hue = (meshData.fragId * 0.1) % 1;
    return new THREE.Color().setHSL(hue, 0.7, 0.5);
  };

  const getWireframeColor = () => {
    if (isSelected) return '#ff9999';
    if (isHovered) return '#7fdddd';
    const hue = (meshData.fragId * 0.1) % 1;
    return new THREE.Color().setHSL(hue, 1.0, 0.8);
  };

  if (!geometry) {
    return null; // ジオメトリが準備できるまで何も描画しない
  }

  return (
    <group>
      {/* ソリッドメッシュ */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(meshData);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(meshData);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onUnhover();
        }}
      >
        <meshPhongMaterial
          color={getColor()}
          transparent={isHovered || isSelected}
          opacity={isSelected ? 0.8 : isHovered ? 0.9 : 1.0}
          side={THREE.DoubleSide}
          depthTest={true}
          depthWrite={true}
        />
      </mesh>

      {/* ワイヤーフレーム */}
      <mesh ref={wireframeRef} geometry={geometry}>
        <meshBasicMaterial
          color={getWireframeColor()}
          wireframe={true}
          transparent={true}
          opacity={isSelected ? 1.0 : isHovered ? 0.8 : 0.3}
          side={THREE.DoubleSide}
          depthTest={true}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// 要素情報パネルコンポーネント
function ElementInfoPanel({ 
  selectedElement, 
  onClose, 
  onPropertyChange 
}: {
  selectedElement: ExtractedMeshData | null;
  onClose: () => void;
  onPropertyChange: (property: string, value: any) => void;
}) {
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

      {/* プロパティセクションの修正 */}
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

// 抽出されたメッシュを表示するコンポーネント（選択機能付き）
function ExtractedMeshes({ 
  meshData, 
  selectedElement, 
  hoveredElement,
  onSelect, 
  onHover,
  onUnhover 
}: { 
  meshData: ExtractedMeshData[];
  selectedElement: ExtractedMeshData | null;
  hoveredElement: ExtractedMeshData | null;
  onSelect: (meshData: ExtractedMeshData) => void;
  onHover: (meshData: ExtractedMeshData) => void;
  onUnhover: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current || !meshData || meshData.length === 0) return;

    console.log('=== ThreeViewer: Processing selectable mesh data ===');
    console.log('Mesh data count:', meshData.length);

    // 既存のメッシュをクリア
    while (groupRef.current.children.length > 0) {
      const child = groupRef.current.children[0];
      groupRef.current.remove(child);
      if (child instanceof THREE.Group) {
        child.children.forEach(mesh => {
          if (mesh instanceof THREE.Mesh) {
            if (mesh.geometry) mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(mat => mat.dispose());
            } else if (mesh.material) {
              mesh.material.dispose();
            }
          }
        });
      }
    }

    console.log(`Creating ${meshData.length} selectable meshes`);
  }, [meshData]);

  return (
    <group ref={groupRef}>
      {meshData.map((mesh, index) => (
        <SelectableMesh
          key={`${mesh.dbId}-${mesh.fragId}`}
          meshData={mesh}
          isSelected={selectedElement?.dbId === mesh.dbId && selectedElement?.fragId === mesh.fragId}
          isHovered={hoveredElement?.dbId === mesh.dbId && hoveredElement?.fragId === mesh.fragId}
          onSelect={onSelect}
          onHover={onHover}
          onUnhover={onUnhover}
        />
      ))}
    </group>
  );
}

// カメラコントローラー（自動でシーンにフィット）
function CameraController({ meshData }: { meshData: ExtractedMeshData[] }) {
  const [hasAdjusted, setHasAdjusted] = useState(false);

  useFrame(({ camera, scene }) => {
    // メッシュが追加された後、一度だけカメラを調整
    if (meshData.length > 0 && !hasAdjusted) {
      const box = new THREE.Box3().setFromObject(scene);
      if (!box.isEmpty()) {
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        
        // カメラ距離を計算
        const distance = maxSize * 1.5;
        const cameraDistance = Math.max(distance, 5); // 最小距離を5に設定
        
        // カメラ位置を設定（斜め上から見下ろす角度）
        camera.position.set(
          center.x + cameraDistance * 0.8,
          center.y + cameraDistance * 0.8,
          center.z + cameraDistance * 0.8
        );
        
        // カメラをシーンの中心に向ける
        camera.lookAt(center);
        camera.updateProjectionMatrix();
        
        console.log('=== Camera adjusted for selectable meshes ===');
        console.log('Scene center:', center.toArray());
        console.log('Scene size:', size.toArray());
        console.log('Camera position:', camera.position.toArray());
        
        setHasAdjusted(true);
      }
    }
  });

  return null;
}

// メイン Three Viewer コンポーネント
export function ThreeViewer() {
  const [meshData, setMeshData] = useState<ExtractedMeshData[]>([]);
  const [selectedElement, setSelectedElement] = useState<ExtractedMeshData | null>(null);
  const [hoveredElement, setHoveredElement] = useState<ExtractedMeshData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 要素選択ハンドラー
  const handleElementSelect = useCallback((element: ExtractedMeshData) => {
    console.log('Element selected:', {
      dbId: element.dbId,
      fragId: element.fragId,
      name: element.elementInfo?.name,
      category: element.elementInfo?.category
    });
    
    // プロパティの詳細構造をデバッグ出力
    if (element.elementInfo?.properties) {
      console.log('Element properties structure:');
      Object.entries(element.elementInfo.properties).forEach(([key, value]) => {
        console.log(`  ${key}:`, {
          value: value,
          type: typeof value,
          hasValueProperty: typeof value === 'object' && value !== null && 'value' in value,
          hasTypeProperty: typeof value === 'object' && value !== null && 'type' in value,
          typeValue: typeof value === 'object' && value !== null && value.type ? value.type : 'no type',
          typeOfType: typeof value === 'object' && value !== null && value.type ? typeof value.type : 'no type property'
        });
      });
    }
    
    setSelectedElement(element);
  }, []);

  // 要素ホバーハンドラー
  const handleElementHover = useCallback((element: ExtractedMeshData) => {
    setHoveredElement(element);
  }, []);

  // 要素ホバー解除ハンドラー
  const handleElementUnhover = useCallback(() => {
    setHoveredElement(null);
  }, []);

  // プロパティ変更ハンドラー
  const handlePropertyChange = useCallback((property: string, value: any) => {
    if (!selectedElement) return;

    console.log('Property change requested:', {
      dbId: selectedElement.dbId,
      property,
      oldValue: selectedElement.elementInfo?.properties?.[property],
      newValue: value
    });

    // 選択された要素のプロパティを更新
    const updatedElement = {
      ...selectedElement,
      elementInfo: {
        ...selectedElement.elementInfo,
        properties: {
          ...selectedElement.elementInfo?.properties,
          [property]: {
            ...selectedElement.elementInfo?.properties?.[property],
            value: value
          }
        }
      }
    };

    // メッシュデータ配列内の該当要素を更新
    const updatedMeshData = meshData.map(mesh => 
      mesh.dbId === selectedElement.dbId && mesh.fragId === selectedElement.fragId 
        ? updatedElement 
        : mesh
    );

    setMeshData(updatedMeshData);
    setSelectedElement(updatedElement);

    // グローバルデータも更新
    if (window.extractedGeometries) {
      window.extractedGeometries = updatedMeshData;
    }

    // 変更をカスタムイベントで通知
    const event = new CustomEvent('elementPropertyChanged', {
      detail: {
        dbId: selectedElement.dbId,
        fragId: selectedElement.fragId,
        property,
        value,
        element: updatedElement
      }
    });
    window.dispatchEvent(event);

    console.log('Property updated successfully');
  }, [selectedElement, meshData]);

  // 選択解除ハンドラー
  const handleDeselectElement = useCallback(() => {
    setSelectedElement(null);
  }, []);

  useEffect(() => {
    // メッシュデータ抽出イベントのリスナーを設定
    const handleMeshDataExtracted = (event: CustomEvent) => {
      console.log('=== ThreeViewer: Received mesh data extraction event ===');
      console.log('Event detail:', event.detail);
      
      setIsLoading(true);
      setError(null);

      try {
        const { meshData: extractedData } = event.detail;
        
        if (!extractedData || !Array.isArray(extractedData)) {
          throw new Error('Invalid mesh data format');
        }

        if (extractedData.length === 0) {
          throw new Error('No mesh data received');
        }

        console.log('Processing extracted mesh data:', extractedData.length, 'meshes');
        
        // 要素情報の統計を表示
        const withElementInfo = extractedData.filter(mesh => mesh.elementInfo);
        const withProperties = extractedData.filter(mesh => 
          mesh.elementInfo?.properties && Object.keys(mesh.elementInfo.properties).length > 0
        );
        
        console.log('Element info statistics:', {
          total: extractedData.length,
          withElementInfo: withElementInfo.length,
          withProperties: withProperties.length
        });

        // サンプル要素情報を表示
        extractedData.slice(0, 3).forEach((mesh, index) => {
          console.log(`Sample element ${index}:`, {
            dbId: mesh.dbId,
            fragId: mesh.fragId,
            name: mesh.elementInfo?.name,
            category: mesh.elementInfo?.category,
            type: mesh.elementInfo?.type,
            propertyCount: mesh.elementInfo?.properties ? Object.keys(mesh.elementInfo.properties).length : 0,
            hasBoundingBox: !!mesh.elementInfo?.boundingBox
          });
        });

        setMeshData(extractedData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error processing mesh data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setIsLoading(false);
      }
    };

    // イベントリスナーを追加
    window.addEventListener('meshDataExtracted', handleMeshDataExtracted as EventListener);

    // 既にグローバルにメッシュデータが存在する場合は読み込み
    if (window.extractedGeometries && window.extractedGeometries.length > 0) {
      console.log('Found existing mesh data:', window.extractedGeometries.length);
      setMeshData(window.extractedGeometries);
    }

    // クリーンアップ
    return () => {
      window.removeEventListener('meshDataExtracted', handleMeshDataExtracted as EventListener);
    };
  }, []);

  // メッシュデータをクリアする関数
  const clearMeshData = () => {
    setMeshData([]);
    setSelectedElement(null);
    setHoveredElement(null);
    setError(null);
    window.extractedGeometries = [];
  };

  // 背景クリックで選択解除
  const handleBackgroundClick = useCallback(() => {
    setSelectedElement(null);
  }, []);

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
        {/* ライティング */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[100, 100, 50]} 
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-100, -100, -100]} intensity={0.5} />
        <pointLight position={[100, -100, 100]} intensity={0.3} />

        {/* グリッド */}
        <Grid 
          args={[1000, 1000]} 
          cellSize={10} 
          cellThickness={0.5} 
          cellColor="#6b7280" 
          sectionSize={100} 
          sectionThickness={1} 
          sectionColor="#374151"
          fadeDistance={500}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />

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

        {/* カメラコントロール */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          dampingFactor={0.05}
          screenSpacePanning={false}
          maxDistance={5000}
          minDistance={1}
        />

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
      <div className="absolute top-4 right-4 bg-black/70 text-white p-3 rounded z-10">
        <div className="text-sm mb-2">Three.js Interactive Viewer</div>
        <div className="text-xs space-y-1">
          <div>Meshes: {meshData.length}</div>
          <div>Selected: {selectedElement ? `${selectedElement.elementInfo?.name || `Element ${selectedElement.dbId}`}` : 'None'}</div>
          <div>Hovered: {hoveredElement ? `${hoveredElement.elementInfo?.name || `Element ${hoveredElement.dbId}`}` : 'None'}</div>
          {meshData.length > 0 && (
            <div className="space-y-1 mt-2">
              <button
                onClick={clearMeshData}
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs block w-full"
              >
                Clear All
              </button>
              <button
                onClick={handleDeselectElement}
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

      {/* ローディング状態 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Processing mesh data with element info...</p>
          </div>
        </div>
      )}

      {/* エラー状態 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white p-4">
          <div className="bg-red-800 p-4 rounded-md max-w-md">
            <h3 className="text-lg font-bold mb-2">Error</h3>
            <p className="text-sm mb-3">{error}</p>
            <button
              onClick={() => setError(null)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* メッシュデータがない場合の表示 */}
      {!isLoading && !error && meshData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
          <div className="text-center p-6 bg-black/50 rounded-lg">
            <div className="text-lg mb-2">No mesh data available</div>
            <div className="text-sm text-gray-300 mb-4">
              Load a model in the APS Viewer and click "Extract Mesh"
            </div>
            <div className="text-xs text-gray-400">
              Steps:
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Upload a file using the file uploader</li>
                <li>Wait for the model to load in APS Viewer</li>
                <li>Click the "Extract Mesh" button</li>
                <li>Interactive mesh data will appear here</li>
              </ol>
            </div>
            <div className="mt-4 p-3 bg-blue-900/50 rounded text-xs">
              <div className="font-semibold mb-1">Interactive Features:</div>
              <div>• Click elements to select and view properties</div>
              <div>• Hover elements for highlighting</div>
              <div>• Edit dimensional properties</div>
              <div>• View element information panel</div>
              <div>• Real-time property updates</div>
            </div>
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

      {/* デバッグ情報パネル（開発時のみ表示） */}
      {process.env.NODE_ENV === 'development' && meshData.length > 0 && (
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
      )}

      {/* パフォーマンス情報 */}
      {meshData.length > 50 && (
        <div className="absolute bottom-20 left-4 bg-yellow-900/70 text-white p-2 rounded text-xs z-10">
          <div className="font-semibold">Performance Notice</div>
          <div>Rendering {meshData.length} meshes</div>
          <div>Consider using LOD for better performance</div>
        </div>
      )}
    </div>
  );
}

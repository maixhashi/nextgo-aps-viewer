'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

// メッシュデータの型定義
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
}

// 抽出されたメッシュを表示するコンポーネント
function ExtractedMeshes({ meshData }: { meshData: ExtractedMeshData[] }) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current || !meshData || meshData.length === 0) return;

    console.log('=== ThreeViewer: Processing mesh data ===');
    console.log('Mesh data count:', meshData.length);

    // 既存のメッシュをクリア
    while (groupRef.current.children.length > 0) {
      const child = groupRef.current.children[0];
      groupRef.current.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
    }

    // 全メッシュのバウンディングボックスを計算するための変数
    const allBounds = new THREE.Box3();
    const createdMeshes: THREE.Mesh[] = [];

    // 抽出されたメッシュデータからThree.jsメッシュを作成
    meshData.forEach((meshInfo, index) => {
      try {
        console.log(`\n=== Processing Mesh ${index} ===`);
        console.log('Mesh info:', {
          dbId: meshInfo.dbId,
          fragId: meshInfo.fragId,
          hasGeometryData: !!meshInfo.geometryData,
          hasMatrix: !!meshInfo.matrixWorld
        });

        const { geometryData, matrixWorld } = meshInfo;
        
        if (!geometryData || !geometryData.vertices || geometryData.vertices.length === 0) {
          console.warn(`No valid geometry data for mesh ${index}`);
          return;
        }

        console.log('Geometry data details:', {
          hasVertices: !!geometryData.vertices,
          hasNormals: !!geometryData.normals,
          hasIndices: !!geometryData.indices,
          vertexCount: geometryData.vertexCount,
          verticesLength: geometryData.vertices?.length || 0,
          indicesLength: geometryData.indices?.length || 0
        });

        if (geometryData.vertices.length % 3 !== 0) {
          console.warn(`Invalid vertex data length for mesh ${index}:`, geometryData.vertices.length);
          return;
        }

        // 頂点データのサンプルを表示（変換前）
        const sampleVertices = Array.from(geometryData.vertices.slice(0, 9));
        console.log('Original sample vertices:', sampleVertices);

        // Three.js BufferGeometryを作成
        const geometry = new THREE.BufferGeometry();
        
        // 座標系変換: Y軸とZ軸を交換、Z軸反転（統一パターン）
        const transformedVertices = new Float32Array(geometryData.vertices.length);
        for (let i = 0; i < geometryData.vertices.length; i += 3) {
          transformedVertices[i] = geometryData.vertices[i];         // X
          transformedVertices[i + 1] = geometryData.vertices[i + 2]; // Z -> Y
          transformedVertices[i + 2] = -geometryData.vertices[i + 1]; // -Y -> Z
        }

        console.log('Transformed sample vertices:', Array.from(transformedVertices.slice(0, 9)));
        
        // 頂点データを設定
        geometry.setAttribute('position', new THREE.BufferAttribute(transformedVertices, 3));
        console.log('Set position attribute with', transformedVertices.length / 3, 'vertices');

        // 法線データがある場合は同様に変換
        if (geometryData.normals && geometryData.normals.length > 0) {
          if (geometryData.normals.length === geometryData.vertices.length) {
            const transformedNormals = new Float32Array(geometryData.normals.length);
            for (let i = 0; i < geometryData.normals.length; i += 3) {
              transformedNormals[i] = geometryData.normals[i];
              transformedNormals[i + 1] = geometryData.normals[i + 2];
              transformedNormals[i + 2] = -geometryData.normals[i + 1];
            }
            geometry.setAttribute('normal', new THREE.BufferAttribute(transformedNormals, 3));
            console.log('Set transformed normal attribute');
          } else {
            console.warn('Normal data length mismatch, computing normals instead');
            geometry.computeVertexNormals();
          }
        } else {
          // 法線データがない場合は計算
          geometry.computeVertexNormals();
          console.log('Computed vertex normals');
        }

        // インデックスデータの処理
        if (geometryData.indices && geometryData.indices.length > 0) {
          if (geometryData.indices.length % 3 === 0) {
            // インデックスをそのまま使用（ワインディングオーダーは変更しない）
            const indices = new Uint32Array(geometryData.indices);
            geometry.setIndex(new THREE.BufferAttribute(indices, 1));
            console.log('Set index attribute with', indices.length / 3, 'triangles');
            
            // インデックスの範囲をチェック
            const maxIndex = Math.max(...indices);
            const vertexCount = transformedVertices.length / 3;
            if (maxIndex >= vertexCount) {
              console.warn(`Index out of range: max index ${maxIndex}, vertex count ${vertexCount}`);
            }
          } else {
            console.warn('Invalid index data length for mesh', index, ':', geometryData.indices.length);
          }
        } else {
          // インデックスがない場合は、頂点を直接三角形として扱う
          console.log('No indices, treating vertices as triangles directly');
        }

        // バウンディングボックスを計算
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();

        // ジオメトリのバウンディングボックス情報を表示
        if (geometry.boundingBox) {
          const bbox = geometry.boundingBox;
          const size = bbox.getSize(new THREE.Vector3());
          console.log('Geometry bounding box:', {
            min: bbox.min.toArray(),
            max: bbox.max.toArray(),
            size: size.toArray(),
            isEmpty: bbox.isEmpty()
          });

          // 非常に小さいジオメトリの警告
          if (size.length() < 0.001) {
            console.warn(`Very small geometry detected for mesh ${index}, size:`, size.length());
          }
        }

        // マテリアルを作成（より見やすく）
        const hue = (index * 0.1) % 1;
        const solidMaterial = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(hue, 0.7, 0.5),
          transparent: false,
          opacity: 1.0,
          side: THREE.DoubleSide,
          wireframe: false,
          flatShading: false,
          // カリングを無効にして面の消失を防ぐ
          depthTest: true,
          depthWrite: true
        });

        // ワイヤーフレーム用のマテリアル（より目立つように）
        const wireframeMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(hue, 1.0, 0.8),
          wireframe: true,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
          linewidth: 2 // ブラウザによっては効果がない場合がある
        });

        // メッシュを作成
        const solidMesh = new THREE.Mesh(geometry.clone(), solidMaterial);
        const wireframeMesh = new THREE.Mesh(geometry.clone(), wireframeMaterial);
        
        // 変換行列を適用
        if (matrixWorld && Array.isArray(matrixWorld) && matrixWorld.length === 16) {
          const matrix = new THREE.Matrix4();
          matrix.fromArray(matrixWorld);
          
          // 行列の詳細を表示
          const position = new THREE.Vector3();
          const quaternion = new THREE.Quaternion();
          const scale = new THREE.Vector3();
          matrix.decompose(position, quaternion, scale);
          
          console.log('Transformation matrix details:', {
            position: position.toArray(),
            scale: scale.toArray(),
            determinant: matrix.determinant()
          });

          // スケールが0に近い場合は警告
          if (scale.x < 0.001 || scale.y < 0.001 || scale.z < 0.001) {
            console.warn(`Very small scale detected for mesh ${index}:`, scale.toArray());
          }

          // 負のスケールがある場合は警告（面の向きが反転する可能性）
          if (scale.x < 0 || scale.y < 0 || scale.z < 0) {
            console.warn(`Negative scale detected for mesh ${index}:`, scale.toArray());
          }
          
          solidMesh.applyMatrix4(matrix);
          wireframeMesh.applyMatrix4(matrix.clone());
          console.log('Applied transformation matrix');
        } else {
          console.warn('Invalid or missing transformation matrix for mesh', index);
        }

        // メッシュの最終位置を確認
        solidMesh.updateMatrixWorld();
        const meshBounds = new THREE.Box3().setFromObject(solidMesh);
        
        if (!meshBounds.isEmpty()) {
          console.log('Final mesh bounds:', {
            min: meshBounds.min.toArray(),
            max: meshBounds.max.toArray(),
            center: meshBounds.getCenter(new THREE.Vector3()).toArray(),
            size: meshBounds.getSize(new THREE.Vector3()).toArray()
          });

          // 全体のバウンディングボックスに追加
          allBounds.union(meshBounds);

          // グループに追加
          groupRef.current?.add(solidMesh);
          groupRef.current?.add(wireframeMesh);
          createdMeshes.push(solidMesh);
          
          console.log(`Successfully created Three.js mesh ${index}`);
        } else {
          console.warn(`Mesh ${index} has empty bounds, skipping`);
        }

      } catch (error) {
        console.error(`Error creating mesh ${index}:`, error);
      }
    });

    // 全体のバウンディングボックス情報を表示
    if (!allBounds.isEmpty()) {
      const center = allBounds.getCenter(new THREE.Vector3());
      const size = allBounds.getSize(new THREE.Vector3());
      console.log('=== Overall scene bounds ===');
      console.log('Center:', center.toArray());
      console.log('Size:', size.toArray());
      console.log('Min:', allBounds.min.toArray());
      console.log('Max:', allBounds.max.toArray());
      console.log('Created meshes:', createdMeshes.length);
    } else {
      console.warn('All meshes have empty bounds');
    }

    console.log(`=== Created ${groupRef.current.children.length} Three.js objects (${createdMeshes.length} solid + ${createdMeshes.length} wireframe) ===`);
  }, [meshData]);

  return <group ref={groupRef} />;
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
        
        console.log('=== Camera adjusted ===');
        console.log('Scene center:', center.toArray());
        console.log('Scene size:', size.toArray());
        console.log('Camera position:', camera.position.toArray());
        console.log('Camera distance:', cameraDistance);
        
        setHasAdjusted(true);
      }
    }
  });

  return null;
}

export function ThreeViewer() {
  const [meshData, setMeshData] = useState<ExtractedMeshData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        
        // データ構造の詳細確認
        extractedData.slice(0, 3).forEach((mesh, index) => {
          console.log(`Sample mesh ${index}:`, {
            dbId: mesh.dbId,
            fragId: mesh.fragId,
            hasGeometryData: !!mesh.geometryData,
            geometryDataKeys: mesh.geometryData ? Object.keys(mesh.geometryData) : [],
            vertexCount: mesh.geometryData?.vertexCount,
            verticesType: mesh.geometryData?.vertices?.constructor?.name,
            verticesLength: mesh.geometryData?.vertices?.length,
            indicesLength: mesh.geometryData?.indices?.length,
            hasNormals: !!mesh.geometryData?.normals
          });
          
          // 頂点データのサンプル表示
          if (mesh.geometryData?.vertices && mesh.geometryData.vertices.length > 0) {
            console.log(`Mesh ${index} vertex sample:`, Array.from(mesh.geometryData.vertices.slice(0, 9)));
          }
          
          // インデックスデータのサンプル表示
          if (mesh.geometryData?.indices && mesh.geometryData.indices.length > 0) {
            console.log(`Mesh ${index} index sample:`, Array.from(mesh.geometryData.indices.slice(0, 9)));
          }
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
    setError(null);
    window.extractedGeometries = [];
  };

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

        {/* 抽出されたメッシュ */}
        {meshData.length > 0 && <ExtractedMeshes meshData={meshData} />}

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

      {/* UI オーバーレイ */}
      <div className="absolute top-4 right-4 bg-black/70 text-white p-3 rounded z-10">
        <div className="text-sm mb-2">Three.js Viewer</div>
        <div className="text-xs space-y-1">
          <div>Meshes: {meshData.length}</div>
          {meshData.length > 0 && (
            <div className="space-y-1">
              <button
                onClick={clearMeshData}
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs block w-full"
              >
                Clear
              </button>
              <div className="text-gray-300 text-xs">
                <div>Transform: Y-Z swap, Z flip</div>
                <div>Faces: Double-sided</div>
                <div>Wireframe: Enabled</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* デバッグ情報パネル */}
      {meshData.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white p-3 rounded z-10 max-w-sm">
          <div className="text-sm mb-2">Debug Info</div>
          <div className="text-xs space-y-1">
            <div>Total meshes processed: {meshData.length}</div>
            <div>Check console for detailed logs</div>
            <div className="mt-2 p-2 bg-yellow-900/50 rounded">
              <div className="font-semibold">Troubleshooting:</div>
              <div>• If faces are missing, check winding order</div>
              <div>• If meshes are invisible, check scale/position</div>
              <div>• Wireframes show geometry structure</div>
              <div>• Both solid and wireframe are rendered</div>
            </div>
          </div>
        </div>
      )}

      {/* ローディング状態 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Processing mesh data...</p>
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
                <li>Mesh data will appear here</li>
              </ol>
            </div>
            <div className="mt-4 p-3 bg-blue-900/50 rounded text-xs">
              <div className="font-semibold mb-1">Expected for RoofSampleFile.rvt:</div>
              <div>• Building geometry with roof structures</div>
              <div>• Multiple mesh fragments</div>
              <div>• Both solid surfaces and wireframes</div>
              <div>• Proper coordinate transformation applied</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

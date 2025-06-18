'use client';

import { useEffect, useRef, useState } from 'react';
import { useAPSViewerStore } from '@/store/apsViewerStore';

// Autodesk Viewerの型定義
declare global {
  interface Window {
    Autodesk: any;
    extractedGeometries?: any[];
  }
}

export function APSViewer() {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewerInstance, setViewerInstance] = useState<any>(null);
  const [meshExtension, setMeshExtension] = useState<any>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const { urn, accessToken, isLoading, error, setError } = useAPSViewerStore();

  // 拡張機能をインラインで定義・登録する関数
  const registerMeshExtension = () => {
    if (!window.Autodesk || !window.Autodesk.Viewing) {
      console.error('Autodesk Viewing not available');
      return false;
    }

    try {
      // 拡張機能クラスの定義
      class MeshDataExtension extends window.Autodesk.Viewing.Extension {
        constructor(viewer: any, options: any) {
          super(viewer, options);
          this.extractedMeshes = [];
          console.log('MeshDataExtension constructor called');
        }

        load() {
          console.log('MeshDataExtension load() called');
          return true;
        }

        unload() {
          console.log('MeshDataExtension unload() called');
          return true;
        }

        // Autodesk ViewerのジオメトリからThree.js用のデータを抽出（改良版）
        extractGeometryData(renderProxy: any) {
          try {
            if (!renderProxy || !renderProxy.geometry) {
              console.warn('Invalid renderProxy or missing geometry');
              return null;
            }

            const geometry = renderProxy.geometry;
            console.log('=== Geometry Analysis ===');
            console.log('Geometry object:', geometry);
            console.log('Geometry constructor:', geometry.constructor.name);

            let vertices = null;
            let normals = null;
            let indices = null;

            // 方法1: attributes経由でのアクセス
            if (geometry.attributes) {
              console.log('Available attributes:', Object.keys(geometry.attributes));
              
              // position属性の詳細確認
              if (geometry.attributes.position) {
                const posAttr = geometry.attributes.position;
                console.log('Position attribute:', {
                  itemSize: posAttr.itemSize,
                  count: posAttr.count,
                  array: posAttr.array ? posAttr.array.constructor.name : 'no array',
                  arrayLength: posAttr.array ? posAttr.array.length : 0
                });
                
                if (posAttr.array && posAttr.array.length > 0) {
                  vertices = new Float32Array(posAttr.array);
                  console.log('Extracted vertices from attributes.position:', vertices.length);
                }
              }
              
              // normal属性の確認
              if (geometry.attributes.normal) {
                const normAttr = geometry.attributes.normal;
                if (normAttr.array && normAttr.array.length > 0) {
                  normals = new Float32Array(normAttr.array);
                  console.log('Extracted normals from attributes.normal:', normals.length);
                }
              }
            }

            // 方法2: 直接プロパティアクセス（attributesで見つからない場合）
            if (!vertices) {
              console.log('Trying direct property access...');
              console.log('Available geometry properties:', Object.keys(geometry));
              
              // VB (Vertex Buffer) からの抽出
              if (geometry.vb && geometry.vb.length > 0) {
                const stride = geometry.vbstride || 3;
                console.log('VB details:', {
                  vbLength: geometry.vb.length,
                  stride: stride,
                  estimatedVertexCount: Math.floor(geometry.vb.length / stride)
                });

                // ストライドに基づいて頂点データを抽出
                const vertexCount = Math.floor(geometry.vb.length / stride);
                vertices = new Float32Array(vertexCount * 3);
                
                for (let i = 0; i < vertexCount; i++) {
                  const srcIndex = i * stride;
                  const dstIndex = i * 3;
                  vertices[dstIndex] = geometry.vb[srcIndex];     // X
                  vertices[dstIndex + 1] = geometry.vb[srcIndex + 1]; // Y
                  vertices[dstIndex + 2] = geometry.vb[srcIndex + 2]; // Z
                }
                
                console.log('Extracted vertices from vb:', vertices.length);
                
                // 法線データも同様に抽出（ストライドが6以上の場合）
                if (stride >= 6 && !normals) {
                  normals = new Float32Array(vertexCount * 3);
                  for (let i = 0; i < vertexCount; i++) {
                    const srcIndex = i * stride;
                    const dstIndex = i * 3;
                    normals[dstIndex] = geometry.vb[srcIndex + 3];     // NX
                    normals[dstIndex + 1] = geometry.vb[srcIndex + 4]; // NY
                    normals[dstIndex + 2] = geometry.vb[srcIndex + 5]; // NZ
                  }
                  console.log('Extracted normals from vb:', normals.length);
                }
              }
            }

            // インデックスの抽出
            if (geometry.ib && geometry.ib.length > 0) {
              indices = new Uint32Array(geometry.ib);
              console.log('Extracted indices from ib:', indices.length);
            } else if (geometry.index && geometry.index.array) {
              indices = new Uint32Array(geometry.index.array);
              console.log('Extracted indices from index.array:', indices.length);
            } else if (geometry.attributes && geometry.attributes.index) {
              const idxAttr = geometry.attributes.index;
              if (idxAttr.array && idxAttr.array.length > 0) {
                indices = new Uint32Array(idxAttr.array);
                console.log('Extracted indices from attributes.index:', indices.length);
              }
            }

            if (!vertices || vertices.length === 0) {
              console.warn('No vertex data found in geometry');
              return null;
            }

            // データの妥当性チェック
            const hasValidVertices = vertices && vertices.length > 0 && vertices.length % 3 === 0;
            const hasValidIndices = !indices || (indices.length > 0 && indices.length % 3 === 0);

            console.log('Data validation:', {
              hasValidVertices,
              hasValidIndices,
              vertexCount: vertices.length / 3,
              triangleCount: indices ? indices.length / 3 : 'no indices'
            });

            if (!hasValidVertices) {
              console.warn('Invalid vertex data');
              return null;
            }

            const result = {
              vertices: vertices,
              normals: normals,
              indices: indices,
              vertexCount: vertices.length / 3
            };

            console.log('=== Final extracted geometry data ===');
            console.log('Result:', {
              vertexCount: result.vertexCount,
              hasNormals: !!normals,
              hasIndices: !!indices,
              verticesLength: vertices.length,
              indicesLength: indices ? indices.length : 0
            });

            return result;
          } catch (error) {
            console.error('Error extracting geometry data:', error);
            return null;
          }
        }

        // 全てのメッシュデータを取得（制限を解除して全メッシュを処理）
        getAllMeshData() {
          if (!this.viewer || !this.viewer.model) {
            console.error('Viewer or model not available');
            return [];
          }

          const model = this.viewer.model;
          const fragList = model.getFragmentList();
          const allMeshes: any[] = [];

          try {
            console.log('Starting mesh extraction...');
            console.log('Fragment count:', fragList.fragments.fragId2dbId.length);
            
            // 全てのフラグメントを処理（制限を解除）
            const totalFragments = fragList.fragments.fragId2dbId.length;
            let processedCount = 0;
            let successCount = 0;
            
            for (let fragId = 0; fragId < totalFragments; fragId++) {
              try {
                const dbId = fragList.fragments.fragId2dbId[fragId];
                if (dbId === undefined) continue;

                processedCount++;
                
                // 進捗表示（100個ごと）
                if (processedCount % 100 === 0) {
                  console.log(`Processing fragment ${processedCount}/${totalFragments}...`);
                }

                const renderProxy = this.viewer.impl.getRenderProxy(model, fragId);
                if (!renderProxy) {
                  continue;
                }

                // より詳細なrenderProxyの分析
                const hasGeometry = !!renderProxy.geometry;
                const hasMatrix = !!renderProxy.matrixWorld;
                const hasMaterial = !!renderProxy.material;

                if (!hasGeometry) {
                  continue;
                }

                // ジオメトリデータを抽出
                const geometryData = this.extractGeometryData(renderProxy);
                if (!geometryData) {
                  continue;
                }

                // 変換行列を取得
                let matrixArray = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; // デフォルト単位行列
                if (renderProxy.matrixWorld) {
                  if (renderProxy.matrixWorld.elements) {
                    matrixArray = [...renderProxy.matrixWorld.elements];
                  } else if (Array.isArray(renderProxy.matrixWorld)) {
                    matrixArray = [...renderProxy.matrixWorld];
                  }
                }

                // マテリアル情報を取得
                let materialInfo = null;
                if (renderProxy.material) {
                  materialInfo = {
                    color: renderProxy.material.color || 0xffffff,
                    opacity: renderProxy.material.opacity || 1.0,
                    transparent: renderProxy.material.transparent || false,
                    wireframe: renderProxy.material.wireframe || false
                  };
                }

                allMeshes.push({
                  dbId: dbId,
                  fragId: fragId,
                  geometryData: geometryData,
                  matrixWorld: matrixArray,
                  material: materialInfo
                });

                successCount++;

              } catch (error) {
                console.warn(`Failed to extract mesh for fragId ${fragId}:`, error);
              }
            }

            console.log(`Successfully extracted ${successCount} meshes out of ${processedCount} processed fragments`);
            console.log(`Success rate: ${((successCount / processedCount) * 100).toFixed(1)}%`);
            
            this.extractedMeshes = allMeshes;
            return allMeshes;
          } catch (error) {
            console.error('Error during mesh extraction:', error);
            return [];
          }
        }

        // 抽出したメッシュデータをグローバルに公開
        exportMeshData() {
          console.log('=== Starting mesh data export ===');
          const meshData = this.getAllMeshData();
          
          console.log('Extracted mesh data count:', meshData.length);
          
          if (meshData.length > 0) {
            // 統計情報を表示
            const stats = {
              totalMeshes: meshData.length,
              withIndices: meshData.filter(m => m.geometryData.indices).length,
              withNormals: meshData.filter(m => m.geometryData.normals).length,
              totalVertices: meshData.reduce((sum, m) => sum + m.geometryData.vertexCount, 0),
              totalTriangles: meshData.reduce((sum, m) => sum + (m.geometryData.indices ? m.geometryData.indices.length / 3 : m.geometryData.vertexCount / 3), 0)
            };
            
            console.log('=== Mesh Statistics ===');
            console.log('Total meshes:', stats.totalMeshes);
            console.log('Meshes with indices:', stats.withIndices);
            console.log('Meshes with normals:', stats.withNormals);
            console.log('Total vertices:', stats.totalVertices);
            console.log('Total triangles:', Math.floor(stats.totalTriangles));

            // 最初の5個のメッシュの詳細情報を出力
            meshData.slice(0, 5).forEach((mesh, index) => {
              console.log(`\n=== Mesh ${index} Details ===`);
              console.log('DbId:', mesh.dbId);
              console.log('FragId:', mesh.fragId);
              console.log('Vertex count:', mesh.geometryData?.vertexCount || 0);
              console.log('Vertices length:', mesh.geometryData?.vertices?.length || 0);
              console.log('Indices length:', mesh.geometryData?.indices?.length || 0);
              console.log('Has normals:', !!mesh.geometryData?.normals);
              console.log('Has material:', !!mesh.material);
              
              if (mesh.geometryData?.vertices) {
                console.log('Sample vertices:', Array.from(mesh.geometryData.vertices.slice(0, 9)));
              }
              if (mesh.geometryData?.indices) {
                console.log('Sample indices:', Array.from(mesh.geometryData.indices.slice(0, 9)));
              }
            });

            // 大きなメッシュ（頂点数が多い）を特定
            const largeMeshes = meshData
              .filter(m => m.geometryData.vertexCount > 100)
              .sort((a, b) => b.geometryData.vertexCount - a.geometryData.vertexCount)
              .slice(0, 10);
            
            if (largeMeshes.length > 0) {
              console.log('\n=== Top 10 Largest Meshes ===');
              largeMeshes.forEach((mesh, index) => {
                console.log(`${index + 1}. FragId ${mesh.fragId}: ${mesh.geometryData.vertexCount} vertices`);
              });
            }

            window.extractedGeometries = meshData;
            
            // カスタムイベントを発火
            const event = new CustomEvent('meshDataExtracted', {
              detail: { meshData }
            });
            
            console.log('Dispatching meshDataExtracted event with', meshData.length, 'meshes');
            window.dispatchEvent(event);
            
            console.log('=== Mesh data export completed ===');
            return meshData;
          } else {
            console.warn('=== No mesh data extracted ===');
            return [];
          }
        }
      }

      // 拡張機能を登録
      window.Autodesk.Viewing.theExtensionManager.registerExtension('MeshDataExtension', MeshDataExtension);
      console.log('MeshDataExtension registered successfully');
      return true;
    } catch (error) {
      console.error('Failed to register MeshDataExtension:', error);
      return false;
    }
  };

  // Autodesk Viewerスクリプトが読み込まれたかどうかを確認する関数
  const checkAutodeskScriptLoaded = () => {
    return window.Autodesk && window.Autodesk.Viewing && window.Autodesk.Viewing.Extension;
  };

  // メッシュデータを抽出する関数
  const extractMeshData = () => {
    if (meshExtension && modelLoaded) {
      console.log('Extracting mesh data...');
      try {
        const result = meshExtension.exportMeshData();
        if (result.length === 0) {
          setError('メッシュデータが見つかりませんでした。モデルが完全に読み込まれているか確認してください。');
        } else {
          console.log(`Successfully extracted ${result.length} meshes`);
        }
      } catch (error) {
        console.error('Error during mesh extraction:', error);
        setError('メッシュデータの抽出中にエラーが発生しました');
      }
    } else {
      console.warn('Mesh extension not loaded or model not ready');
      setError('メッシュ抽出の準備ができていません');
    }
  };

  // ビューワーの初期化
  useEffect(() => {
    // URNとアクセストークンが取得できるまで待機
    if (!urn || !accessToken || !viewerRef.current) return;

    let viewer: any;
    let checkInterval: NodeJS.Timeout;

    const initializeViewer = () => {
      try {
        const options = {
          env: 'AutodeskProduction',
          accessToken: accessToken
        };

        // Autodesk Viewerの初期化
        console.log('Calling Autodesk.Viewing.Initializer');
        window.Autodesk.Viewing.Initializer(options, () => {
          console.log('Initializer callback executed');
          
          // 拡張機能を登録
          const extensionRegistered = registerMeshExtension();
          if (!extensionRegistered) {
            setError('拡張機能の登録に失敗しました');
            return;
          }

          viewer = new window.Autodesk.Viewing.GuiViewer3D(viewerRef.current);
          viewer.start();
          setViewerInstance(viewer);

          // モデルの読み込み
          const documentId = urn?.startsWith('urn:') ? urn : `urn:${urn}`;
          console.log('Loading document with ID:', documentId);
          
          window.Autodesk.Viewing.Document.load(
            documentId,
            (doc: any) => {
              console.log('Document loaded successfully');
              const defaultModel = doc.getRoot().getDefaultGeometry();
              console.log('Default geometry:', defaultModel);
              
              viewer.loadDocumentNode(doc, defaultModel).then(() => {
                console.log('Model loaded successfully');
                setModelLoaded(true);
                
                // モデル読み込み完了後に拡張を読み込み（少し長めに待機）
                setTimeout(() => {
                  viewer.loadExtension('MeshDataExtension').then((ext: any) => {
                    console.log('MeshDataExtension loaded successfully');
                    setMeshExtension(ext);
                  }).catch((err: any) => {
                    console.error('Failed to load MeshDataExtension:', err);
                    setError(`拡張機能の読み込みに失敗しました: ${err.message || err}`);
                  });
                }, 3000); // 3秒待機
              }).catch((err: any) => {
                console.error('Failed to load document node:', err);
                setError(`ドキュメントノードの読み込みに失敗しました: ${err.message || err}`);
              });
            },
            (err: any) => {
              console.error('モデルの読み込みに失敗しました:', err);
              setError(`モデルの読み込みに失敗しました: ${err instanceof Error ? err.message : String(err)}`);
            }
          );
        });
      } catch (error) {
        console.error('ビューワーの初期化中にエラーが発生しました:', error);
        setError(error instanceof Error ? error.message : '不明なエラーが発生しました');
      }
    };

    try {
      console.log('Initializing viewer with URN:', urn);
      console.log('Access Token:', accessToken);
      
      // Autodesk Viewerスクリプトが読み込まれるまで待機
      if (!checkAutodeskScriptLoaded()) {
        console.log('Waiting for Autodesk Viewer script to load...');
        
        checkInterval = setInterval(() => {
          if (checkAutodeskScriptLoaded()) {
            console.log('Autodesk Viewer script loaded, initializing viewer...');
            clearInterval(checkInterval);
            initializeViewer();
          }
        }, 500);
        
        return () => {
          if (checkInterval) clearInterval(checkInterval);
        };
      } else {
        console.log('Autodesk Viewer script already loaded');
        initializeViewer();
      }
    } catch (error) {
      console.error('ビューワーの初期化中にエラーが発生しました:', error);
      setError(error instanceof Error ? error.message : '不明なエラーが発生しました');
    }

    // クリーンアップ関数
    return () => {
      if (viewer) {
        viewer.finish();
      }
      setModelLoaded(false);
      setMeshExtension(null);
    };
  }, [urn, accessToken, setError]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={viewerRef} 
        id="forgeViewer" 
        className="w-full h-full"
      />
      
      <div className="viewer-label absolute top-4 left-4 bg-black/70 text-white p-2 rounded z-10">
        <div className="text-sm mb-2">Autodesk Platform Services Viewer</div>
        <div className="flex flex-col gap-2">
          {meshExtension && modelLoaded && (
            <button
              onClick={extractMeshData}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
            >
              Extract Mesh
            </button>
          )}
          <div className="text-xs">
            {!modelLoaded && <span className="text-yellow-300">Loading model...</span>}
            {modelLoaded && !meshExtension && <span className="text-yellow-300">Loading extension...</span>}
            {modelLoaded && meshExtension && <span className="text-green-300">Ready to extract</span>}
          </div>
        </div>
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
            <p>読み込み中...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white p-4">
          <div className="bg-red-800 p-4 rounded-md max-w-md">
            <h3 className="text-xl font-bold mb-2">エラーが発生しました</h3>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

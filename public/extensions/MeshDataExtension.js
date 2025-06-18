(function() {
  'use strict';

  // Autodesk Viewerが読み込まれるまで待機する関数
  function waitForAutodesk(callback) {
    if (typeof Autodesk !== 'undefined' && Autodesk.Viewing && Autodesk.Viewing.Extension) {
      callback();
    } else {
      setTimeout(() => waitForAutodesk(callback), 100);
    }
  }

  // 拡張機能の定義と登録
  waitForAutodesk(() => {
    class MeshDataExtension extends Autodesk.Viewing.Extension {
      constructor(viewer, options) {
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

      // 特定のdbIdのメッシュデータを取得
      getMeshDataByDbId(dbId) {
        if (!this.viewer || !this.viewer.model) {
          console.error('Viewer or model not available');
          return [];
        }

        const instanceTree = this.viewer.model.getData().instanceTree;
        const fragIds = [];
        
        instanceTree.enumNodeFragments(dbId, (fragId) => {
          fragIds.push(fragId);
        });

        const geometries = fragIds.map((fragId) => {
          try {
            const renderProxy = this.viewer.impl.getRenderProxy(this.viewer.model, fragId);
            if (renderProxy && renderProxy.geometry && renderProxy.matrixWorld) {
              return {
                geometry: renderProxy.geometry.clone(),
                matrixWorld: renderProxy.matrixWorld.clone(),
                fragId: fragId,
                dbId: dbId
              };
            }
          } catch (error) {
            console.warn('Failed to get render proxy for fragId:', fragId, error);
          }
          return null;
        }).filter(Boolean);

        return geometries;
      }

      // 全てのメッシュデータを取得
      getAllMeshData() {
        if (!this.viewer || !this.viewer.model) {
          console.error('Viewer or model not available');
          return [];
        }

        const instanceTree = this.viewer.model.getData().instanceTree;
        const allMeshes = [];

        try {
          // 全てのノードを走査
          instanceTree.enumNodeChildren(instanceTree.getRootId(), (dbId) => {
            const fragIds = [];
            instanceTree.enumNodeFragments(dbId, (fragId) => {
              fragIds.push(fragId);
            });

            fragIds.forEach((fragId) => {
              try {
                const renderProxy = this.viewer.impl.getRenderProxy(this.viewer.model, fragId);
                if (renderProxy && renderProxy.geometry && renderProxy.matrixWorld) {
                  allMeshes.push({
                    dbId: dbId,
                    fragId: fragId,
                    geometry: renderProxy.geometry.clone(),
                    matrixWorld: renderProxy.matrixWorld.clone(),
                    material: renderProxy.material
                  });
                }
              } catch (error) {
                console.warn('Failed to extract mesh for fragId:', fragId, error);
              }
            });
          }, true);
        } catch (error) {
          console.error('Error during mesh extraction:', error);
        }

        this.extractedMeshes = allMeshes;
        console.log('Extracted meshes count:', allMeshes.length);
        return allMeshes;
      }

      // 抽出したメッシュデータをグローバルに公開
      exportMeshData() {
        console.log('Starting mesh data export...');
        const meshData = this.getAllMeshData();
        
        if (meshData.length > 0) {
          window.extractedGeometries = meshData;
          
          // カスタムイベントを発火してReact側に通知
          window.dispatchEvent(new CustomEvent('meshDataExtracted', {
            detail: { meshData }
          }));
          
          console.log('Mesh data exported successfully:', meshData.length, 'meshes');
        } else {
          console.warn('No mesh data extracted');
        }
        
        return meshData;
      }
    }

    // 拡張機能を登録
    try {
      Autodesk.Viewing.theExtensionManager.registerExtension('MeshDataExtension', MeshDataExtension);
      console.log('MeshDataExtension registered successfully');
      
      // グローバルに登録完了フラグを設定
      window.MeshDataExtensionRegistered = true;
    } catch (error) {
      console.error('Failed to register MeshDataExtension:', error);
    }
  });

})();
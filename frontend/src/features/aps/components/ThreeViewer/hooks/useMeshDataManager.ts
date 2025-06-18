import { useState, useEffect, useCallback } from 'react';
import { ExtractedMeshData } from '../types';

export function useMeshDataManager() {
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

  return {
    meshData,
    selectedElement,
    hoveredElement,
    isLoading,
    error,
    handleElementSelect,
    handleElementHover,
    handleElementUnhover,
    handlePropertyChange,
    handleDeselectElement,
    clearMeshData,
    handleBackgroundClick
  };
}
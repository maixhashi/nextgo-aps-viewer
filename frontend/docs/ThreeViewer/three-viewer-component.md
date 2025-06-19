# ThreeViewer コンポーネント

ThreeViewerは、3Dモデルを表示、操作、変換するための高度なReactコンポーネントです。Three.jsとReact Three Fiberを使用して構築されており、3Dメッシュの表示、選択、変換、プロパティの表示と編集などの機能を提供します。

## 目次

1. [概要](#概要)
2. [アーキテクチャ](#アーキテクチャ)
3. [主要コンポーネント](#主要コンポーネント)
4. [状態管理](#状態管理)
5. [フック](#フック)
6. [イベント処理](#イベント処理)
7. [使用方法](#使用方法)
8. [カスタマイズ](#カスタマイズ)

## 概要

ThreeViewerは、Autodesk Platform Services (APS)から抽出された3Dメッシュデータを表示するために設計されています。ユーザーは3Dモデルを表示し、要素を選択し、それらのプロパティを表示・編集し、選択した要素を変換（移動、回転、拡大縮小）することができます。

主な機能：
- 3Dメッシュの表示と操作
- 要素の選択とハイライト
- 要素のプロパティ表示と編集
- 変換コントロール（移動、回転、拡大縮小）
- カメラコントロール
- デバッグ情報の表示

## アーキテクチャ

ThreeViewerは、モジュール化されたコンポーネント構造を採用しており、各コンポーネントが特定の機能を担当します。状態管理にはValtioを使用し、Three.jsとReact Three Fiberを使用して3Dレンダリングを行います。

### ディレクトリ構造

```
ThreeViewer/
├── CameraController.tsx      - カメラ制御
├── DebugPanel.tsx            - デバッグ情報表示
├── ElementInfoPanel.tsx      - 要素情報パネル
├── ExtractedMeshes.tsx       - 抽出されたメッシュのコンテナ
├── LoadingAndErrorStates.tsx - ローディングとエラー状態
├── SceneControls.tsx         - シーンコントロール
├── SceneGrid.tsx             - シーングリッド
├── SceneLighting.tsx         - シーンライティング
├── SelectableMesh.tsx        - 選択可能なメッシュ
├── SelectedElementInfo.tsx   - 選択された要素の情報
├── TransformControls.tsx     - 変換コントロール
├── UIOverlay.tsx             - UIオーバーレイ
├── global.d.ts               - グローバル型定義
├── hooks/                    - カスタムフック
│   ├── useCameraControl.ts   - カメラ制御フック
│   └── useMeshDataManager.ts - メッシュデータ管理フック
├── index.ts                  - エクスポート
├── index.tsx                 - メインコンポーネント
├── store/                    - 状態管理
│   └── transformStore.ts     - 変換状態ストア
├── types.ts                  - 型定義
└── utils/                    - ユーティリティ関数
```

## 主要コンポーネント

### ThreeViewer (index.tsx)

メインコンポーネントで、他のすべてのコンポーネントを統合します。React Three Fiberの`Canvas`を使用して3Dシーンをレンダリングし、メッシュデータの管理、要素の選択、UIの表示などを行います。

```tsx
export function ThreeViewer() {
  // useMeshDataManagerフックを使用してメッシュデータと関連機能を取得
  const {
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
    clearMeshData
  } = useMeshDataManager();

  // ...

  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* Three.js Canvas */}
      <Canvas>
        <SceneLighting />
        <SceneGrid />
        <ExtractedMeshes 
          meshData={meshData}
          selectedElement={selectedElement}
          hoveredElement={hoveredElement}
          onSelect={handleElementSelect}
          onHover={handleElementHover}
          onUnhover={handleElementUnhover}
        />
        <TransformControls />
      </Canvas>

      {/* UI Components */}
      <SelectedElementInfo 
        selectedElement={selectedElement} 
        onClose={handleDeselectElement}
      />
      <UIOverlay
        meshData={meshData}
        selectedElement={selectedElement}
        hoveredElement={hoveredElement}
        onClearMeshData={clearMeshData}
        onDeselectElement={handleDeselectElement}
      />
      <LoadingAndErrorStates
        meshData={meshData}
        isLoading={isLoading}
        error={error}
        onErrorClose={() => {}}
      />
      <DebugPanel
        meshData={meshData}
        selectedElement={selectedElement}
      />
    </div>
  );
}
```

### ExtractedMeshes

メッシュデータの配列を受け取り、各メッシュを`SelectableMesh`コンポーネントとしてレンダリングします。選択状態とホバー状態を管理し、適切なイベントハンドラを提供します。

```tsx
export function ExtractedMeshes({ 
  meshData, 
  selectedElement, 
  hoveredElement,
  onSelect, 
  onHover,
  onUnhover 
}: ExtractedMeshesProps) {
  // ...
  
  return (
    <group ref={groupRef}>
      {meshData.map((mesh, index) => {
        const isSelected = selectedElement?.dbId === mesh.dbId && selectedElement?.fragId === mesh.fragId;
        const isHovered = hoveredElement?.dbId === mesh.dbId && hoveredElement?.fragId === mesh.fragId;

        return (
          <SelectableMesh
            key={`${mesh.dbId}-${mesh.fragId}`}
            meshData={mesh}
            isSelected={isSelected}
            isHovered={isHovered}
            onSelect={onSelect}
            onHover={onHover}
            onUnhover={onUnhover}
          />
        );
      })}
    </group>
  );
}
```

### SelectableMesh

個々のメッシュをレンダリングし、選択、ホバー、変換などのインタラクションを処理します。Three.jsのジオメトリとマテリアルを作成し、メッシュをレンダリングします。

主な機能：
- メッシュのジオメトリとマテリアルの作成
- 選択状態とホバー状態に基づく視覚的フィードバック
- クリック、ホバー、コンテキストメニューなどのイベント処理
- メッシュのキャッシュ管理

### TransformControls

選択された要素に対する変換コントロール（移動、回転、拡大縮小）を提供します。React Three Dreiの`TransformControls`を使用して実装されています。

```tsx
export function TransformControls() {
  const snap = useSnapshot(transformState);
  const { scene } = useThree();
  const orbitControlsRef = useRef<any>();
  const transformControlsRef = useRef<any>();
  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(null);

  // ...

  return (
    <>
      <OrbitControls
        ref={orbitControlsRef}
        makeDefault
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 1.75}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />
      
      {isValidObject && (
        <DreiTransformControls
          ref={transformControlsRef}
          object={selectedObject}
          mode={getCurrentTransformMode()}
          showX={true}
          showY={true}
          showZ={true}
          size={1}
          space="world"
        />
      )}
    </>
  );
}
```

### SelectedElementInfo

選択された要素の詳細情報を表示するドラッグ可能なパネルです。要素のプロパティ、変換情報、ジオメトリ情報などを表示します。

主な機能：
- 要素の基本情報表示
- 変換情報の表示
- プロパティの表示
- ドラッグ可能なウィンドウ
- 最小化/最大化機能

### UIOverlay

ユーザーインターフェースのオーバーレイを提供し、コントロール情報、統計情報、アクションボタンなどを表示します。

```tsx
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
        {/* コントロール情報 */}
      </div>

      {/* Top Right - Stats */}
      <div className="absolute top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-sm pointer-events-auto">
        {/* 統計情報 */}
      </div>

      {/* Bottom Left - Actions */}
      <div className="absolute bottom-4 left-4 space-y-2 pointer-events-auto">
        {/* アクションボタン */}
      </div>

      {/* Transform Mode Indicator */}
      {snap.selectedElement && (
        <div className="absolute bottom-4 right-4 bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-lg shadow-lg pointer-events-auto">
          {/* 変換モード表示 */}
        </div>
      )}
    </div>
  );
}
```

### ElementInfoPanel

要素のプロパティを表示・編集するためのパネルです。プロパティの編集機能を提供します。

```tsx
export function ElementInfoPanel({ 
  selectedElement, 
  onClose, 
  onPropertyChange 
}: ElementInfoPanelProps) {
  const [editingProperty, setEditingProperty] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // ...

  return (
    <div className="absolute top-4 left-4 bg-white shadow-lg rounded-lg p-4 max-w-md max-h-96 overflow-y-auto z-20">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Element Information</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl font-bold">×</button>
      </div>

      {/* 基本情報 */}
      <div className="mb-4">
        {/* 要素の基本情報 */}
      </div>

      {/* バウンディングボックス情報 */}
      {/* プロパティセクション */}
      {/* ジオメトリ情報 */}
    </div>
  );
}
```

### その他のコンポーネント

- **SceneLighting**: シーンのライティングを設定
- **SceneGrid**: シーンのグリッドを表示
- **SceneControls**: カメラコントロールを設定
- **CameraController**: カメラの自動調整を行う
- **LoadingAndErrorStates**: ローディングとエラー状態を表示
- **DebugPanel**: デバッグ情報を表示

## 状態管理

ThreeViewerは、Valtioを使用して状態管理を行っています。主な状態は`transformStore.ts`で管理されています。

### transformStore

変換関連の状態を管理するストアです。選択された要素、ホバーされた要素、変換モード、変換中かどうかなどの状態を管理します。

```typescript
export type TransformMode = 'translate' | 'rotate' | 'scale';

export interface TransformState {
  selectedElement: ExtractedMeshData | null;
  hoveredElement: ExtractedMeshData | null;
  mode: number; // 0=translate, 1=rotate, 2=scale
  isTransforming: boolean;
}

export const transformModes: TransformMode[] = ['translate', 'rotate', 'scale'];

export const transformState = proxy<TransformState>({
  selectedElement: null,
  hoveredElement: null,
  mode: 0,
  isTransforming: false
});

// アクション
export const setSelectedElement = (element: ExtractedMeshData | null) => {
  transformState.selectedElement = element;
};

export const setHoveredElement = (element: ExtractedMeshData | null) => {
  transformState.hoveredElement = element;
};

export const cycleTransformMode = () => {
  transformState.mode = (transformState.mode + 1) % transformModes.length;
};

export const setTransforming = (isTransforming: boolean) => {
  transformState.isTransforming = isTransforming;
};

export const getCurrentTransformMode = (): TransformMode => {
  return transformModes[transformState.mode];
};
```

## フック

ThreeViewerは、いくつかのカスタムフックを使用して機能を実装しています。

### useMeshDataManager

メッシュデータの管理、要素の選択、ホバー、プロパティ変更などの機能を提供するフックです。

主な機能：
- メッシュデータの管理
- 要素の選択と選択解除
- 要素のホバー
- プロパティの変更
- カスタムイベントの処理

```typescript
export function useMeshDataManager() {
  const [meshData, setMeshData] = useState<ExtractedMeshData[]>([]);
  const [selectedElement, setSelectedElement] = useState<ExtractedMeshData | null>(null);
  const [hoveredElement, setHoveredElement] = useState<ExtractedMeshData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ...

  // 要素選択ハンドラー
  const handleElementSelect = useCallback((element: ExtractedMeshData, event?: any) => {
    setSelectedElement(element);
    setTransformSelectedElement(element);
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
    // プロパティ変更の処理
  }, [selectedElement, meshData]);

  // ...

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
```

### useCameraControl

カメラの自動調整を行うフックです。メッシュデータが読み込まれた後、シーン全体が見えるようにカメラを調整します。

```typescript
export function useCameraControl(meshData: ExtractedMeshData[]) {
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
        const cameraDistance = Math.max(distance, 5);
        
        // カメラ位置を設定
        camera.position.set(
          center.x + cameraDistance * 0.8,
          center.y + cameraDistance * 0.8,
          center.z + cameraDistance * 0.8
        );
        
        // カメラをシーンの中心に向ける
        camera.lookAt(center);
        camera.updateProjectionMatrix();
        
        setHasAdjusted(true);
      }
    }
  });

  return null;
}
```

## イベント処理

ThreeViewerは、いくつかのカスタムイベントを使用してコンポーネント間の通信を行っています。

### カスタムイベント

- **meshDataExtracted**: メッシュデータが抽出されたときに発火するイベント
- **elementPropertyChanged**: 要素のプロパティが変更されたときに発火するイベント
- **elementTransformChanged**: 要素の変換が変更されたときに発火するイベント

```typescript
// global.d.ts
declare global {
  interface Window {
    extractedGeometries: ExtractedMeshData[];
  }

  interface WindowEventMap {
    'meshDataExtracted': CustomEvent<{
      meshData: ExtractedMeshData[];
    }>;
    'elementPropertyChanged': CustomEvent<{
      dbId: number;
      fragId: number;
      property: string;
      value: any;
      element: ExtractedMeshData;
    }>;
    'elementTransformChanged': CustomEvent<{
      dbId: number;
      fragId: number;
      position: { x: number; y: number; z: number };
      rotation: { x: number; y: number; z: number };
      scale: { x: number; y: number; z: number };
      element: ExtractedMeshData;
    }>;
  }
}
```

## 使用方法

ThreeViewerコンポーネントは、以下のように使用できます：

```tsx
import { ThreeViewer } from 'path/to/ThreeViewer';

function MyApp() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ThreeViewer />
    </div>
  );
}
```

ThreeViewerは、グローバルな`window.extractedGeometries`配列からメッシュデータを読み込みます。また、`meshDataExtracted`イベントをリッスンして新しいメッシュデータを取得します。

### メッシュデータの提供

メッシュデータは、以下のような形式で提供する必要があります：

```typescript
const meshData: ExtractedMeshData[] = [
  {
    dbId: 1,
    fragId: 0,
    geometryData: {
      vertices: new Float32Array([...]),
      normals: new Float32Array([...]),
      indices: new Uint32Array([...]),
      vertexCount: 123
    },
    matrixWorld: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    elementInfo: {
      name: 'Element Name',
      category: 'Category',
      type: 'Type',
      properties: {
        property1: { value: 'value1', type: 'string' },
        property2: { value: 123, type: 'number' }
      },
      boundingBox: {
        min: [0, 0, 0],
        max: [10, 10, 10],
        center: [5, 5, 5],
        size: [10, 10, 10]
      }
    }
  }
];

// グローバル配列に設定
window.extractedGeometries = meshData;

// または、カスタムイベントを発火
const event = new CustomEvent('meshDataExtracted', {
  detail: { meshData }
});
window.dispatchEvent(event);
```

## カスタマイズ

ThreeViewerは、モジュール化された構造を持っているため、各コンポーネントを個別にカスタマイズすることができます。

### スタイルのカスタマイズ

各コンポーネントは、TailwindCSSを使用してスタイリングされています。クラス名を変更することで、スタイルをカスタマイズできます。

### 機能のカスタマイズ

特定の機能を追加または変更したい場合は、関連するコンポーネントを拡張または修正することができます。例えば、新しい変換モードを追加したい場合は、`transformStore.ts`の`transformModes`配列に新しいモードを追加し、関連するコンポーネントを更新します。

### イベントのカスタマイズ

新しいイベントを追加したい場合は、`global.d.ts`に新しいイベント型を追加し、関連するコンポーネントでイベントをリッスンまたは発火するようにします。

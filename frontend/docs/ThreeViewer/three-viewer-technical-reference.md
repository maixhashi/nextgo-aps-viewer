# ThreeViewer 技術リファレンス

このドキュメントは、ThreeViewerコンポーネントの技術的な詳細、コンポーネント間の相互作用、データフロー、およびイベント処理について説明します。

## コンポーネント間の相互作用

ThreeViewerは複数のコンポーネントが連携して動作する複雑なシステムです。以下に主要なコンポーネント間の相互作用を示します。

### データフローの概要

```
                                  +-------------------+
                                  |                   |
                                  |   グローバル状態   |
                                  |  (window.extracted|
                                  |   Geometries)     |
                                  |                   |
                                  +--------+----------+
                                           |
                                           v
+------------------+            +----------+-----------+
|                  |            |                      |
|  transformStore  +<---------->+  useMeshDataManager  |
|  (Valtio)        |            |  (状態管理フック)    |
|                  |            |                      |
+--------+---------+            +----------+-----------+
         ^                                 |
         |                                 v
         |                      +----------+-----------+
         |                      |                      |
         |                      |    ThreeViewer       |
         |                      |    (メインコンポーネント)|
         |                      |                      |
         |                      +----------+-----------+
         |                                 |
         |                                 v
+--------+---------+            +----------+-----------+
|                  |            |                      |
| TransformControls+<---------->+   ExtractedMeshes    |
|                  |            |                      |
+------------------+            +----------+-----------+
                                           |
                                           v
                                +----------+-----------+
                                |                      |
                                |    SelectableMesh    |
                                |                      |
                                +----------+-----------+
                                           |
                                           v
                                +----------+-----------+
                                |                      |
                                |   UI Components      |
                                | (SelectedElementInfo,|
                                |  ElementInfoPanel,   |
                                |  UIOverlay, etc.)    |
                                |                      |
                                +----------------------+
```

### 主要なデータフロー

1. **メッシュデータの読み込み**:
   - `window.extractedGeometries`グローバル配列または`meshDataExtracted`カスタムイベントからメッシュデータを取得
   - `useMeshDataManager`フックがデータを処理し、状態を管理

2. **要素の選択**:
   - ユーザーが`SelectableMesh`をクリック
   - `handleElementSelect`が呼び出され、選択状態を更新
   - `transformStore`の`setSelectedElement`アクションが実行され、グローバル選択状態を更新
   - UI要素（`SelectedElementInfo`など）が更新された選択状態に基づいて表示を更新

3. **変換操作**:
   - 選択された要素に対して`TransformControls`が有効化
   - ユーザーが変換操作を実行（移動、回転、拡大縮小）
   - 変換イベントが発火し、`elementTransformChanged`カスタムイベントを通じて通知
   - 関連コンポーネントが変換情報を更新

4. **プロパティ編集**:
   - ユーザーが`ElementInfoPanel`でプロパティを編集
   - `handlePropertyChange`が呼び出され、プロパティを更新
   - `elementPropertyChanged`カスタムイベントを通じて変更を通知
   - メッシュデータが更新され、UI要素が更新された情報を表示

## 状態管理の詳細

### transformStore (Valtio)

`transformStore`は、Valtioを使用して実装された状態管理ストアで、以下の状態を管理します：

```typescript
export interface TransformState {
  selectedElement: ExtractedMeshData | null;  // 選択された要素
  hoveredElement: ExtractedMeshData | null;   // ホバーされた要素
  mode: number;                               // 変換モード (0=translate, 1=rotate, 2=scale)
  isTransforming: boolean;                    // 変換中かどうか
}
```

主要なアクション：

- `setSelectedElement`: 選択された要素を設定
- `setHoveredElement`: ホバーされた要素を設定
- `cycleTransformMode`: 変換モードを切り替え
- `setTransforming`: 変換中かどうかを設定
- `getCurrentTransformMode`: 現在の変換モードを取得
- `resetTransformState`: 状態をリセット

### useMeshDataManager フック

`useMeshDataManager`フックは、メッシュデータの管理と操作を担当します：

```typescript
export function useMeshDataManager() {
  const [meshData, setMeshData] = useState<ExtractedMeshData[]>([]);
  const [selectedElement, setSelectedElement] = useState<ExtractedMeshData | null>(null);
  const [hoveredElement, setHoveredElement] = useState<ExtractedMeshData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ...
}
```

主要な機能：

- メッシュデータの読み込みと管理
- 要素の選択と選択解除
- 要素のホバー状態管理
- プロパティの変更
- カスタムイベントの処理

## イベント処理の詳細

ThreeViewerは、以下のカスタムイベントを使用してコンポーネント間の通信を行います：

### meshDataExtracted

メッシュデータが抽出されたときに発火するイベント：

```typescript
const event = new CustomEvent('meshDataExtracted', {
  detail: {
    meshData: ExtractedMeshData[]
  }
});
window.dispatchEvent(event);
```

### elementPropertyChanged

要素のプロパティが変更されたときに発火するイベント：

```typescript
const event = new CustomEvent('elementPropertyChanged', {
  detail: {
    dbId: number,
    fragId: number,
    property: string,
    value: any,
    element: ExtractedMeshData
  }
});
window.dispatchEvent(event);
```

### elementTransformChanged

要素の変換が変更されたときに発火するイベント：

```typescript
const event = new CustomEvent('elementTransformChanged', {
  detail: {
    dbId: number,
    fragId: number,
    position: { x: number, y: number, z: number },
    rotation: { x: number, y: number, z: number },
    scale: { x: number, y: number, z: number },
    element: ExtractedMeshData
  }
});
window.dispatchEvent(event);
```

## メッシュデータの構造

ThreeViewerで使用されるメッシュデータの構造は以下の通りです：

```typescript
export interface ExtractedMeshData {
  dbId: number;                // データベースID
  fragId: number;              // フラグメントID
  geometryData: {              // ジオメトリデータ
    vertices: Float32Array;    // 頂点座標
    normals?: Float32Array;    // 法線ベクトル
    indices?: Uint32Array;     // インデックス
    vertexCount: number;       // 頂点数
  };
  matrixWorld: number[];       // ワールド変換行列
  material?: any;              // マテリアル情報
  elementInfo?: {              // 要素情報
    name?: string;             // 名前
    category?: string;         // カテゴリ
    type?: string;             // タイプ
    properties?: {             // プロパティ
      [key: string]: any;
    };
    boundingBox?: {            // バウンディングボックス
      min: number[];
      max: number[];
      center: number[];
      size: number[];
    };
  };
  transform?: {                // 変換情報
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  };
}
```

## SelectableMesh の実装詳細

`SelectableMesh`コンポーネントは、個々のメッシュをレンダリングし、選択、ホバー、変換などのインタラクションを処理します。

主要な機能：

1. **ジオメトリとマテリアルの作成**:
   - Three.jsの`BufferGeometry`を使用してジオメトリを作成
   - 座標系変換（APSの座標系からThree.jsの座標系へ）
   - 法線の処理
   - インデックスの設定
   - バウンディングボックスとバウンディングスフィアの計算
   - 変換行列の適用

2. **マテリアルの管理**:
   - 選択状態とホバー状態に基づく色の設定
   - 透明度の設定

3. **イベント処理**:
   - クリックイベント（選択）
   - コンテキストメニューイベント（変換モード切り替え）
   - ポインターオーバーイベント（ホバー）
   - ポインターアウトイベント（ホバー解除）

4. **メッシュキャッシュ**:
   - パフォーマンス向上のためのメッシュキャッシュ
   - 選択された要素のキャッシュ保持

## TransformControls の実装詳細

`TransformControls`コンポーネントは、選択された要素に対する変換コントロール（移動、回転、拡大縮小）を提供します。

主要な機能：

1. **選択オブジェクトの取得**:
   - キャッシュからメッシュを取得
   - シーン内のオブジェクトを検索

2. **変換コントロールの設定**:
   - 変換モードの設定（移動、回転、拡大縮小）
   - 軸の表示設定
   - サイズと空間の設定

3. **イベント処理**:
   - ドラッグ開始イベント
   - ドラッグ終了イベント
   - オブジェクト変更イベント

4. **OrbitControlsとの連携**:
   - 変換中のOrbitControlsの無効化

## パフォーマンス最適化

ThreeViewerは、以下の方法でパフォーマンスを最適化しています：

1. **メッシュキャッシュ**:
   - 頻繁に使用されるメッシュをキャッシュして再利用

2. **選択的レンダリング**:
   - 必要なメッシュのみをレンダリング
   - 選択されていないメッシュの削除

3. **メモ化**:
   - `useMemo`を使用してジオメトリとマテリアルの再計算を防止

4. **イベントの最適化**:
   - イベントリスナーの適切な追加と削除
   - イベントの伝播の制御

## 拡張ポイント

ThreeViewerは、以下の方法で拡張できます：

1. **新しい変換モードの追加**:
   - `transformModes`配列に新しいモードを追加
   - 関連コンポーネントの更新

2. **新しいUI要素の追加**:
   - 新しいUIコンポーネントの作成
   - メインコンポーネントへの統合

3. **新しいイベントの追加**:
   - `global.d.ts`に新しいイベント型を追加
   - イベントのリッスンと発火の実装

4. **カスタムシェーダーの追加**:
   - Three.jsのシェーダーマテリアルを使用
   - カスタムシェーダーの実装

## 既知の制限事項

1. **大規模モデルのパフォーマンス**:
   - 非常に大きなモデル（数十万メッシュ）の場合、パフォーマンスが低下する可能性があります

2. **メモリ使用量**:
   - 大量のメッシュデータを扱う場合、メモリ使用量が増加します

3. **ブラウザの互換性**:
   - WebGLをサポートしていないブラウザでは動作しません

4. **モバイルデバイスのパフォーマンス**:
   - 一部のモバイルデバイスでは、複雑なモデルのレンダリングパフォーマンスが低下する可能性があります

## トラブルシューティング

1. **メッシュが表示されない**:
   - メッシュデータが正しく提供されているか確認
   - コンソールエラーを確認
   - カメラ位置が適切か確認

2. **選択が機能しない**:
   - イベントリスナーが正しく設定されているか確認
   - メッシュが正しくレンダリングされているか確認
   - レイキャスティングが機能しているか確認

3. **変換コントロールが表示されない**:
   - 要素が正しく選択されているか確認
   - 変換モードが正しく設定されているか確認
   - オブジェクトがシーングラフに存在するか確認

4. **パフォーマンスの問題**:
   - メッシュ数を減らす
   - 不要なメッシュを削除
   - ジオメトリの複雑さを減らす

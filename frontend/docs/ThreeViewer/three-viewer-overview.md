# ThreeViewer コンポーネント概要

## 概要

ThreeViewerは、Autodesk Platform Services (APS)から抽出された3Dメッシュデータを表示・操作するためのReactコンポーネントです。Three.jsとReact Three Fiberを使用して構築されており、3Dモデルの表示、要素の選択、プロパティの表示・編集、3D変換などの機能を提供します。

## 主要機能

- **3Dメッシュの表示**: APSから抽出されたメッシュデータを3D空間に表示
- **要素の選択**: クリックによる要素の選択とハイライト表示
- **プロパティ表示**: 選択された要素の詳細情報とプロパティの表示
- **プロパティ編集**: 特定のプロパティの編集機能
- **3D変換**: 選択された要素の移動、回転、拡大縮小
- **カメラコントロール**: ズーム、パン、回転などのカメラ操作
- **自動カメラ調整**: モデル全体が見えるようにカメラを自動調整

## コンポーネント構成

ThreeViewerは以下の主要コンポーネントで構成されています：

1. **メインコンポーネント**
   - `ThreeViewer`: 全体を統括するメインコンポーネント

2. **シーン関連**
   - `SceneLighting`: シーンのライティング設定
   - `SceneGrid`: 3D空間のグリッド表示
   - `SceneControls`: カメラコントロール設定

3. **メッシュ関連**
   - `ExtractedMeshes`: メッシュデータのコンテナ
   - `SelectableMesh`: 選択可能な個別メッシュ
   - `TransformControls`: 要素の変換コントロール

4. **UI関連**
   - `UIOverlay`: コントロール情報や統計情報の表示
   - `ElementInfoPanel`: 要素のプロパティ表示・編集パネル
   - `SelectedElementInfo`: 選択された要素の詳細情報
   - `DebugPanel`: デバッグ情報の表示
   - `LoadingAndErrorStates`: ローディングとエラー状態の表示

5. **状態管理**
   - `transformStore`: 変換関連の状態管理（Valtio使用）

6. **カスタムフック**
   - `useMeshDataManager`: メッシュデータの管理と操作
   - `useCameraControl`: カメラの自動調整

## データフロー

1. メッシュデータは`window.extractedGeometries`グローバル配列または`meshDataExtracted`カスタムイベントを通じて提供されます
2. `useMeshDataManager`フックがメッシュデータを管理し、選択状態やホバー状態を追跡します
3. `ExtractedMeshes`コンポーネントがメッシュデータを`SelectableMesh`コンポーネントとしてレンダリングします
4. ユーザーがメッシュを選択すると、選択状態が更新され、`SelectedElementInfo`パネルが表示されます
5. 選択された要素に対して、`TransformControls`を使用して変換操作が可能になります
6. 変換操作は`transformStore`で管理され、`elementTransformChanged`イベントを通じて通知されます

## イベント処理

ThreeViewerは以下のカスタムイベントを使用してコンポーネント間の通信を行います：

- `meshDataExtracted`: メッシュデータが抽出されたときに発火
- `elementPropertyChanged`: 要素のプロパティが変更されたときに発火
- `elementTransformChanged`: 要素の変換が変更されたときに発火

## 技術スタック

- **React**: UIコンポーネント
- **Three.js**: 3Dレンダリングエンジン
- **React Three Fiber**: Three.jsのReactラッパー
- **React Three Drei**: Three.js用のReactコンポーネント集
- **Valtio**: 状態管理
- **TailwindCSS**: スタイリング

## 使用例

ThreeViewerは以下のように使用できます：

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

詳細な実装と使用方法については、[three-viewer-component.md](./three-viewer-component.md)を参照してください。

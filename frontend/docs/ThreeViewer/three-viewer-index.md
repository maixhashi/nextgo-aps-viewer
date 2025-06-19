# ThreeViewer ドキュメント

ThreeViewerコンポーネントは、Autodesk Platform Services (APS)から抽出された3Dメッシュデータを表示・操作するための高度なReactコンポーネントです。このドキュメントセットは、ThreeViewerの使用方法、アーキテクチャ、および技術的な詳細を説明します。

## ドキュメント一覧

以下のドキュメントを参照して、ThreeViewerコンポーネントについて詳しく学ぶことができます：

1. [**ThreeViewer概要**](./three-viewer-overview.md)
   - ThreeViewerの高レベルな概要
   - 主要機能の説明
   - コンポーネント構成の概要
   - データフローの基本的な説明
   - 技術スタックの概要

2. [**ThreeViewerコンポーネント詳細**](./three-viewer-component.md)
   - 詳細なコンポーネント説明
   - アーキテクチャと実装の詳細
   - 各コンポーネントの役割と機能
   - 状態管理の詳細
   - カスタムフックの説明
   - 使用方法とカスタマイズオプション

3. [**ThreeViewer技術リファレンス**](./three-viewer-technical-reference.md)
   - コンポーネント間の相互作用
   - 詳細なデータフロー
   - イベント処理の詳細
   - メッシュデータの構造
   - 実装の詳細
   - パフォーマンス最適化
   - 拡張ポイント
   - トラブルシューティング

## クイックスタート

ThreeViewerコンポーネントを使用するには、以下のようにインポートして使用します：

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

詳細な使用方法については、[ThreeViewerコンポーネント詳細](./three-viewer-component.md)を参照してください。

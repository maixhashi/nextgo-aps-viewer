# APSViewer.tsx コンポーネントの詳細解説

このドキュメントは [APSViewer.tsx](https://github.com/maixhashi/nextgo-aps-viewer/blob/b7017aa3aea91cbc5a39871dc1d37c10a159ed90/frontend/src/features/aps/components/APSViewer.tsx) コンポーネントの詳細な解説です。

## 1. コンポーネントの構造と状態管理

### 主要なステート変数
- `viewerRef`: 3Dビューワーを表示するDOMへの参照
- `viewerInstance`: Autodeskビューワーのインスタンス
- `meshExtension`: カスタム拡張機能のインスタンス
- `modelLoaded`: モデルが読み込まれたかどうかのフラグ
- `urn`, `accessToken`, `isLoading`, `error`: ストアから取得したデータ（`useAPSViewerStore`フックを使用）

### グローバル型定義
```typescript
declare global {
  interface Window {
    Autodesk: any;
    extractedGeometries?: any[];
  }
}
```
これにより、WindowオブジェクトにAutodeskプロパティと抽出されたジオメトリを格納するための配列を追加しています。

## 2. 初期化と読み込みプロセス

### ビューワーの初期化フロー
1. URNとアクセストークンが利用可能かチェック
2. Autodesk Viewerスクリプトが読み込まれているかを確認（`checkAutodeskScriptLoaded`関数）
3. スクリプトが読み込まれていない場合は、インターバルで読み込みを待機
4. `initializeViewer`関数でビューワーを初期化:
   - カスタム拡張機能（MeshDataExtension）を登録
   - Autodesk.Viewing.GuiViewer3Dインスタンスを作成
   - URNを使用してドキュメントを読み込み
   - モデルを読み込み、成功したら拡張機能をロード

```typescript
useEffect(() => {
  // URNとアクセストークンが取得できるまで待機
  if (!urn || !accessToken || !viewerRef.current) return;
  
  // 初期化処理...
  
  return () => {
    // クリーンアップ処理...
  };
}, [urn, accessToken, setError]);
```

## 3. MeshDataExtension（カスタム拡張機能）

### 拡張機能の登録
`registerMeshExtension`関数で、Autodeskビューワーにカスタム拡張機能を登録します。この拡張機能は、モデルのジオメトリデータを抽出するための機能を提供します。

### 主要なメソッド
- `extractGeometryData`: レンダリングプロキシからジオメトリデータ（頂点、法線、インデックス）を抽出
  - 複数の方法（attributes経由、直接プロパティアクセス）でジオメトリデータにアクセス
  - 頂点、法線、インデックスデータを抽出し、構造化されたオブジェクトとして返す

- `getElementInfo`: 要素のプロパティ情報（名前、カテゴリ、タイプなど）を取得
  - モデルのプロパティAPIを使用して要素の詳細情報を非同期で取得
  - 名前、カテゴリ、タイプ、およびその他のプロパティを構造化

- `calculateBoundingBox`: 頂点データからバウンディングボックスを計算
  - 頂点座標の最小値と最大値を計算
  - 中心点とサイズを含むバウンディングボックス情報を返す

- `getAllMeshData`: すべてのメッシュデータを取得（要素情報付き）
  - モデルのフラグメントリストから各フラグメントを処理
  - ジオメトリデータ、変換行列、要素情報、バウンディングボックス、マテリアル情報を収集

- `exportMeshData`: 抽出したメッシュデータをグローバル変数に公開し、カスタムイベントを発火
  - 統計情報（メッシュ数、頂点数、三角形数など）を計算して表示
  - `window.extractedGeometries`にデータを格納
  - `meshDataExtracted`カスタムイベントを発火して他のコンポーネントに通知

### データ抽出の詳細プロセス
1. モデルのフラグメントリストを取得
2. 各フラグメントに対して:
   - レンダリングプロキシを取得
   - ジオメトリデータを抽出（頂点、法線、インデックス）
   - 変換行列を取得
   - 要素情報を非同期で取得
   - バウンディングボックスを計算
   - マテリアル情報を取得
3. 抽出したデータを配列に格納
4. 統計情報を表示
5. `window.extractedGeometries`にデータを格納
6. `meshDataExtracted`カスタムイベントを発火

## 4. ユーザーインターフェースと操作

### UI要素
- ビューワーコンテナ: 3Dモデルを表示するメイン領域
- ラベル: ビューワーの状態を表示（「Ready to extract」など）
- 「Extract Mesh」ボタン: メッシュデータを抽出するためのボタン（モデルとメッシュ拡張機能が読み込まれた場合のみ表示）
- ローディングインジケーター: モデル読み込み中に表示されるスピナー
- エラー表示: エラーが発生した場合に表示されるモーダル（エラーメッセージと閉じるボタンを含む）

### メッシュ抽出機能
`extractMeshData`関数は、ユーザーが「Extract Mesh」ボタンをクリックしたときに呼び出され、拡張機能の`exportMeshData`メソッドを実行します。抽出に成功すると、データはグローバル変数に格納され、カスタムイベントが発火します。失敗した場合は、エラーメッセージが表示されます。

```typescript
const extractMeshData = () => {
  if (meshExtension && modelLoaded) {
    console.log('Extracting mesh data...');
    try {
      const result = meshExtension.exportMeshData();
      // 処理...
    } catch (error) {
      console.error('Error during mesh extraction:', error);
      setError('メッシュデータの抽出中にエラーが発生しました');
    }
  } else {
    console.warn('Mesh extension not loaded or model not ready');
    setError('メッシュ抽出の準備ができていません');
  }
};
```

## 5. エラーハンドリング

コンポーネント全体を通して、様々なエラーケースに対応しています:
- スクリプト読み込みエラー
- ビューワー初期化エラー
- モデル読み込みエラー
- 拡張機能登録/読み込みエラー
- メッシュデータ抽出エラー

エラーが発生した場合は、コンソールにエラーを出力し、ユーザーに表示するエラーメッセージを設定します。エラーメッセージはモーダルとして表示され、ユーザーは「閉じる」ボタンをクリックして閉じることができます。

## まとめ

このコンポーネントは、Autodesk Platform Services (APS) Viewerを使用して3Dモデルを表示し、カスタム拡張機能を通じてモデルのジオメトリデータと要素情報を抽出する機能を提供しています。抽出されたデータは、グローバル変数に格納され、カスタムイベントを通じて他のコンポーネント（おそらくThreeViewerなど）で利用できるようになっています。

主な処理の流れは:
1. ビューワーの初期化
2. モデルの読み込み
3. カスタム拡張機能の登録と読み込み
4. ユーザーの操作（Extract Meshボタン）によるメッシュデータの抽出
5. 抽出されたデータのグローバル変数への格納とイベント発火

このコンポーネントは、3Dモデルのジオメトリデータを抽出し、他のコンポーネントでそのデータを利用するための橋渡しの役割を果たしています。特に、複雑な3Dモデルからジオメトリデータを抽出し、それをThree.jsなどのライブラリで利用可能な形式に変換する重要な役割を担っています。

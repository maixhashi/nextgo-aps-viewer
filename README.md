# NextGo APS Viewer

Autodesk Platform Services (APS) のAPIにより任意形式のファイルのモデルを表示するWebアプリケーションです。
Next.jsフロントエンドとGoバックエンドで構築されています。

## 概要
[http://localhost:3000/aps-viewer](http://localhost:3000/aps-viewer)



 - Autodeskの提供する任意形式ファイル(.rvt, .rfa, .dwgなど)をアップロードし、そのファイルのモデルを[APS Viewer](https://aps.autodesk.com/en/docs/viewer/v7/developers_guide/overview/)により描画します。
 - [Extract Mesh]ボタンによりモデルのメッシュデータを抽出し、React Three Fiberにより描画します。


## 前提条件

このアプリケーションを実行する前に、Autodesk Platform Servicesの認証情報を取得する必要があります：

1. [https://aps.autodesk.com/](https://aps.autodesk.com/) でAutodesk Developerアカウントを作成
2. APS Developer Portalで新しいアプリを作成
3. Client IDとClient Secretを取得
4. [APS OAuthチュートリアル](https://aps.autodesk.com/en/docs/oauth/v2/tutorials/)に従ってOAuth 2.0認証を設定

## 機能

- Autodesk Platform Services API による3Dモデル表示
- React Three Fiber によるメッシュモデルの描画、変形操作機能

## ローカル開発環境のセットアップ

### フロントエンド (Next.js)

1. フロントエンドディレクトリに移動：
```bash
cd frontend
```

2. 依存関係をインストール：
```bash
npm install
```

3. フロントエンドディレクトリに`.env`ファイルを作成し、APS認証情報を追加：
```env
NEXT_PUBLIC_APS_CLIENT_ID=your_client_id_here
APS_CLIENT_SECRET=your_client_secret_here
```

4. 開発サーバーを起動：
```bash
npm run dev
```

フロントエンドは [http://localhost:3000](http://localhost:3000) でアクセス可能です

### バックエンド (Go)

1. バックエンドディレクトリに移動：
```bash
cd backend
```

2. `.env`ファイルを作成し、APS認証情報を追加：
```env
APS_CLIENT_ID=your_client_id_here
APS_CLIENT_SECRET=your_client_secret_here
```

3. Go依存関係をインストール：
```bash
go mod tidy
```

4. Goサーバーを実行：
```bash
go run main.go
```

## 環境変数

### フロントエンド (.env)
- `NEXT_PUBLIC_APS_CLIENT_ID`: APS Client ID（パブリック）
- `APS_CLIENT_SECRET`: APS Client Secret（サーバーサイドのみ）

### バックエンド (.env)
- `APS_CLIENT_ID`: APS Client ID
- `APS_CLIENT_SECRET`: APS Client Secret

## APIドキュメント

Autodesk Platform Services APIの詳細については、以下を参照してください：
- [APSドキュメント](https://aps.autodesk.com/en/docs/)
- [OAuth 2.0チュートリアル](https://aps.autodesk.com/en/docs/oauth/v2/tutorials/)
- [Model Derivative API](https://aps.autodesk.com/en/docs/model-derivative/v2/)

## 技術スタック

- **フロントエンド**: Next.js, React, TypeScript
- **バックエンド**: Go
- **認証**: OAuth 2.0
- **3Dビューアー**: Autodesk Platform Services Viewer

## デプロイ
⚠️ **注意**: このアプリケーションはローカル環境での使用のみを想定しており、本番環境にはデプロイされていません。

# NextGo-APS-Viewer セットアップ手順

## プロジェクト構成

```
nextgo-aps-viewer/
├── backend/       # Go サーバー
├── frontend/      # Next.js フロントエンド
├── docs/          # ドキュメント
│   └── setup.md   # 本ファイル
```

---

## 1. Next.js フロントエンドセットアップ

### 初期作成

```bash
cd nextgo-aps-viewer
npx create-next-app@latest frontend --typescript
```

### 依存パッケージインストール

```bash
cd frontend
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスし、動作確認。

---

## 2. Go バックエンドセットアップ

### モジュール初期化

```bash
cd ../backend
go mod init github.com/あなたのGitHubユーザ名/nextgo-aps-viewer/backend
```

### 簡単なサーバーコード作成（`main.go`）

```go
package main

import (
    "fmt"
    "net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello from Go backend!")
}

func main() {
    http.HandleFunc("/", handler)
    fmt.Println("Starting server at :8080")
    http.ListenAndServe(":8080", nil)
}
```

### サーバー起動確認

```bash
go run main.go
```

ブラウザで `http://localhost:8080` にアクセス。

---

## 3. サーバー起動確認のまとめ

- フロントエンド（Next.js）

```bash
cd frontend
npm install
npm run dev
```

- バックエンド（Go）

```bash
cd backend
go run main.go
```

ブラウザでそれぞれ

- `http://localhost:3000`
- `http://localhost:8080`

にアクセスして動作確認してください。
## nextgo-aps-viewer
### バックエンド　（Go）
サーバーの起動
```
 go run cmd/main.go
```

swaggerドキュメントの更新
```
 swag init -g cmd/main.go
```
[http://localhost:8080/swagger/index.html](http://localhost:8080/swagger/index.html)にアクセス
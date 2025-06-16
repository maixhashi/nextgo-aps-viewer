const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// バックエンドのSwagger JSONのURL
const SWAGGER_URL = 'http://localhost:8080/swagger/doc.json';

// 出力ディレクトリ
const OUTPUT_DIR = path.resolve(__dirname, '../src/shared/lib/api');

// 出力ファイル名
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'api-types.ts');

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

try {
  console.log('OpenAPI仕様からTypeScriptの型定義を生成しています...');
  
  // openapi-typescriptを使用して型定義を生成
  const command = `npx openapi-typescript ${SWAGGER_URL} --output ${OUTPUT_FILE}`;
  
  execSync(command, { stdio: 'inherit' });
  
  console.log(`型定義が正常に生成されました: ${OUTPUT_FILE}`);
} catch (error) {
  console.error('型定義の生成中にエラーが発生しました:', error);
  process.exit(1);
}

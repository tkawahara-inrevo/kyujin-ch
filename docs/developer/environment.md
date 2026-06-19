# 環境変数一覧

`.env` ファイルで管理。本番は `~/kyujin-ch/.env` に配置。

## 必須

### DB

```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

Prisma が利用するメイン接続文字列。

### NextAuth

```bash
AUTH_SECRET="<32byte以上のランダム文字列>"
NEXTAUTH_URL="https://kyujin-ch.jp"
```

- `AUTH_SECRET`: JWT 署名鍵。本番では `openssl rand -base64 32` で生成
- `NEXTAUTH_URL`: 本番ドメイン

## オプション

### Google OAuth（求職者ログイン）

```bash
AUTH_GOOGLE_ID="<Google Cloud Console で取得>"
AUTH_GOOGLE_SECRET="<同上>"
```

未設定の場合、Google ログインボタンは非表示。

### AWS（S3 / SES）

```bash
AWS_REGION="ap-northeast-1"
AWS_ACCESS_KEY_ID="<IAM ユーザーのアクセスキー>"
AWS_SECRET_ACCESS_KEY="<同シークレット>"
S3_BUCKET_NAME="kyujin-ch-uploads"
SES_FROM_EMAIL="noreply@kyujin-ch.jp"
SES_FROM_NAME="求人ちゃんねる"
```

IAM ユーザーには:
- `AmazonS3FullAccess` (バケット限定推奨)
- `AmazonSESFullAccess` (SES v2)

### Slack 通知

```bash
SLACK_WEBHOOK_JOB_REVIEW="https://hooks.slack.com/services/..."
SLACK_WEBHOOK_COMPANY_REQUEST="https://hooks.slack.com/services/..."
```

- 求人審査通知用
- 企業要望通知用

### Anthropic（AI機能、現状未稼働）

```bash
ANTHROPIC_API_KEY="sk-ant-..."
```

将来のコラム自動生成等に使う予定。

### JWT（モバイル API）

```bash
JWT_SECRET="<32byte以上>"  # 未設定の場合 NEXTAUTH_SECRET を流用
JWT_ISSUER="kyujin-ch"
JWT_AUDIENCE="kyujin-ch-mobile"
```

## 開発用デフォルト値

ローカル開発では `.env.local` に上書きを推奨:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kyujin_ch_dev"
AUTH_SECRET="dev-secret-not-for-production"
NEXTAUTH_URL="http://localhost:3000"
```

S3 / SES / Slack は本番のキーを使う場合があるので注意。
ローカルだけで完結したい場合は対応する `lib/*.ts` のヘルパーを mock 化。

## チェックスクリプト

`.env` のチェックヘルパーはない。`npm run dev` で起動時にエラーになる程度。

将来的に `lib/env.ts` で zod 等を使ったランタイム検証を入れる検討中。

## 本番反映

```bash
# 編集
ssh ubuntu@13.159.236.233 "nano ~/kyujin-ch/.env"

# 反映
ssh ubuntu@13.159.236.233 "cd ~/kyujin-ch && pm2 reload kyujin-ch"
```

## セキュリティ

- `.env` は git に含めない（`.gitignore` で除外済み）
- `.env.example` を作って、必要な変数名だけ公開する習慣（現状未整備）
- 本番のキーは1Passwordなどに保管推奨

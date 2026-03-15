# Googleログイン設定

求職者向けの Google ログインは、既存のメールアドレス登録と併用できます。

## 1. Google Cloud で OAuth クライアントを作成

Google Cloud Console で Web アプリ用の OAuth クライアントを作成し、以下のリダイレクト URI を登録します。

```text
http://localhost:3000/api/auth/callback/google
https://kyujin-ch.com/api/auth/callback/google
```

## 2. 環境変数を追加

`.env` または本番環境の環境変数に以下を追加します。

```env
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN=true
```

Google ボタンを非表示にしたい場合は `NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN=false` にします。

## 3. Prisma マイグレーションを適用

Google ログインでは Auth.js 用の `Account` / `Session` / `VerificationToken` テーブルが必要です。

```powershell
cmd /c npx prisma migrate deploy
```

ローカル開発で Prisma Client も更新したい場合:

```powershell
cmd /c npx prisma generate
```

## 4. 動作確認

1. 未ログイン状態でヘッダーや応募導線からログインダイアログを開く
2. `Googleで登録` または `Googleでログイン` を押す
3. Google 認証後に元のページへ戻る

## 補足

- Google ログインは求職者向けの `USER` アカウントのみを想定しています。
- 既存の `COMPANY` / `ADMIN` アカウントは Google ログインできません。
- 同じメールアドレスの既存求職者アカウントがある場合は、そのアカウントに紐づく想定です。

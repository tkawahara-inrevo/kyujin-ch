# 認証フロー

Web は **NextAuth v5**、モバイルは **自作 JWT** の二系統。両者は完全に独立しているが、同じ `User` テーブルを参照する。

## Web側: NextAuth (v5)

### 設定

[auth.ts](../../auth.ts) で全て定義。

- セッション戦略: **JWT**（DBにセッション保存しない）
- セッション期限: **30日**
- セッション更新: 24時間ごと

### プロバイダ

1. **Credentials** (メアド + パスワード or ユーザー名 + パスワード)
   - 求職者: メアドのみ
   - 企業: メアド
   - 管理者: メアド or ユーザー名
2. **Google OAuth**
   - 求職者のみ（COMPANY/ADMIN は拒否）
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` が設定されているとき有効化

### ログイン後のセッション内容

```typescript
session.user = {
  id: string,
  email: string,
  name: string,
  role: "USER" | "COMPANY" | "ADMIN" | "SUPER_ADMIN" | "SEO_EDITOR",
}
```

### パスワード周り

- 保存: **bcryptjs**（10ラウンド）
- COMPANY のみ: 企業の `adminPassword` でも認証可（運営代理ログイン用）

### ヘルパー（lib/auth-helpers.ts）

| 関数 | 用途 |
|---|---|
| `requireCompany()` | COMPANY 以外を /company/login にリダイレクト |
| `requireAdmin()` | ADMIN/SUPER_ADMIN 以外を /admin/login |
| `requireSuperAdmin()` | SUPER_ADMIN 以外を /admin/login |
| `requireAdminPermission(key)` | 個別 permission key 単位で拒否（SUPER_ADMIN は常に通る） |
| `requireColumnEditor()` | ADMIN/SUPER_ADMIN/SEO_EDITOR を許可 |

`requireAdminPermission` は ADMIN ロールの `adminPermissions` JSON を見て、特定機能アクセス権を判定。

## モバイル側: 自作 JWT

### トークン仕様

| トークン | アルゴリズム | 有効期限 | 保存場所 |
|---|---|---|---|
| Access Token | HS256 | **15分** | アプリ側 DataStore |
| Refresh Token | （任意のランダム文字列） | **30日** | アプリ側 DataStore + DBにハッシュ |

`lib/api/jwt.ts` 参照。

### 発行ロジック

```typescript
// アクセストークン
signAccessToken(userId, role)
  → JWT { sub: userId, role, iss: "kyujin-ch", aud: "kyujin-ch-mobile", exp: now + 15min }

// リフレッシュトークン
generateRefreshToken()
  → { token: <random>, hash: SHA-256(token), expiresAt: now + 30day }
  → DBには hash のみ保存（盗難対策）
```

### 認証エンドポイント

| エンドポイント | 用途 |
|---|---|
| `POST /api/v1/auth/register` | 新規登録 → 即トークン発行 |
| `POST /api/v1/auth/login` | ログイン → トークン発行 |
| `POST /api/v1/auth/refresh` | リフレッシュ → 古い refresh を `revokedAt` で無効化、新しい access + refresh を返す |
| `POST /api/v1/auth/logout` | refresh の `revokedAt` を設定 |

### 認証ヘッダー

全ての保護されたエンドポイントは `Authorization: Bearer <accessToken>` を要求。
`lib/api/auth.ts` の `authenticate(req)` が処理。

### ロール

モバイル API は **USER ロールのみ**（求職者専用）。
企業・管理者は Web 利用が前提なので、モバイル API でログインはできるが、機能アクセス側で拒否される設計。

## ロール対応マトリクス

| ロール | Webログイン | モバイルログイン | NextAuth | JWT |
|---|---|---|---|---|
| USER | ✅ | ✅ | ✅ | ✅ |
| COMPANY | ✅ | ❌（API側で拒否） | ✅ | - |
| ADMIN | ✅ | ❌ | ✅ | - |
| SUPER_ADMIN | ✅ | ❌ | ✅ | - |
| SEO_EDITOR | ✅（コラムのみ） | ❌ | ✅ | - |

## サインアウト

| Web | モバイル |
|---|---|
| `signOut()` → セッションCookie削除 | DELETE 自リクエストの refreshToken を `revokedAt` で無効化、ローカル削除 |

## アカウント削除

[app/actions/user/delete-account.ts](../../app/actions/user/delete-account.ts) で実装。

- `isActive: false` にセット
- 個人情報を匿名化
- 全 `refreshTokens` を `revokedAt` で無効化（モバイル側もログアウトされる）
- 応募・お気に入りは保持（企業側 UX のため）

## セキュリティ対策

| 項目 | 対策 |
|---|---|
| パスワード | bcryptjs (10 ラウンド) |
| Refresh トークン盗難 | DBに SHA-256 ハッシュのみ保存、ローテーション |
| トークン漏洩リスク | Access 15分の短命設計 |
| CSRF | NextAuth が標準対応 |
| XSS | React の自動エスケープ + DOMPurify (tiptap) |
| SQL Injection | Prisma パラメタライズドクエリ |
| 認可漏れ | requireAdminPermission の権限チェック厳格化 |

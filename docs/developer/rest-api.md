# REST API（モバイル向け `/api/v1/*`）

詳細な OpenAPI 仕様は [docs/api/openapi.yaml](../api/openapi.yaml) を参照。
ここでは概要と運用ルールを示す。

## ベース URL

```
https://kyujin-ch.jp/api/v1/
```

## 認証

- `Authorization: Bearer <accessToken>` ヘッダー必須（一部の公開エンドポイント除く）
- access token 期限: 15分
- 期限切れ時は `POST /auth/refresh` で更新

## エンドポイント一覧

### 認証 (auth/*)

| メソッド | パス | 認証 | 内容 |
|---|---|---|---|
| POST | `/auth/register` | 不要 | 新規登録 |
| POST | `/auth/login` | 不要 | ログイン |
| POST | `/auth/refresh` | 不要（refreshToken送信） | アクセストークン更新 |
| POST | `/auth/logout` | 不要（refreshToken送信） | ログアウト |

### プロフィール (me/*)

| メソッド | パス | 認証 | 内容 |
|---|---|---|---|
| GET | `/me` | ✅ | プロフィール取得 |
| PATCH | `/me` | ✅ | プロフィール更新 |
| DELETE | `/me` | ✅ | 退会 |
| POST | `/me/avatar` | ✅ | アバター画像アップロード |
| GET | `/me/resume` | ✅ | 履歴書取得（学歴・職歴・資格含む） |
| PATCH | `/me/resume` | ✅ | 履歴書更新 |
| GET | `/me/applications` | ✅ | 応募一覧 |
| GET | `/me/favorites` | ✅ | お気に入り一覧 |

### 求人 (jobs/*)

| メソッド | パス | 認証 | 内容 |
|---|---|---|---|
| GET | `/jobs` | 任意 | 求人一覧（検索・絞り込み） |
| GET | `/jobs/{id}` | 任意 | 求人詳細 |
| POST | `/jobs/{id}/view` | 任意 | PV カウント |
| GET | `/jobs/recommended` | 任意 | おすすめ求人 |

### 応募 (applications/*)

| メソッド | パス | 認証 | 内容 |
|---|---|---|---|
| GET | `/applications` | ✅ | 自分の応募一覧 |
| POST | `/applications` | ✅ | 新規応募 |
| GET | `/applications/{id}` | ✅ | 応募詳細 |

### メッセージ (messages/*)

| メソッド | パス | 認証 | 内容 |
|---|---|---|---|
| GET | `/messages/threads` | ✅ | スレッド一覧 |
| GET | `/messages/threads/{id}` | ✅ | スレッド内メッセージ一覧（ページング: `?before=ISO`） |
| POST | `/messages/threads/{id}/messages` | ✅ | メッセージ送信（ブロックチェック実施） |
| POST | `/messages/threads/{id}/read` | ✅ | 既読化 |

### お気に入り (favorites/*)

| メソッド | パス | 認証 | 内容 |
|---|---|---|---|
| GET | `/favorites` | ✅ | お気に入り一覧 |
| POST | `/favorites` | ✅ | お気に入り追加 |
| DELETE | `/favorites/{jobId}` | ✅ | お気に入り削除 |

### 通報・ブロック (reports/* blocks/*)

| メソッド | パス | 認証 | 内容 |
|---|---|---|---|
| POST | `/reports` | ✅ | 通報送信（targetType: job/company/user/message） |
| GET | `/blocks` | ✅ | ブロック一覧 |
| POST | `/blocks` | ✅ | ブロック |
| DELETE | `/blocks/{userId}` | ✅ | ブロック解除 |

### マスタ (master/*)

| メソッド | パス | 認証 | 内容 |
|---|---|---|---|
| GET | `/master/prefectures` | 不要 | 都道府県リスト |
| GET | `/master/categories` | 不要 | 求人カテゴリリスト |
| GET | `/master/employment-types` | 不要 | 雇用形態リスト |

## 共通仕様

### リクエスト Content-Type

JSON: `application/json`
ファイル: `multipart/form-data`

### レスポンス形式

成功:
```json
{
  "id": "abc123",
  "title": "...",
  ...
}
```

エラー:
```json
{
  "message": "認証情報が無効です",
  "code": "INVALID_CREDENTIALS"
}
```

### ステータスコード

| コード | 意味 |
|---|---|
| 200 | 成功 |
| 201 | 作成成功 |
| 204 | 削除成功（ボディなし） |
| 400 | バリデーションエラー |
| 401 | 未認証 / トークン無効 |
| 403 | 認可エラー（権限不足） |
| 404 | 見つからない |
| 409 | 重複（既に応募済み等） |
| 500 | サーバーエラー |

### ページング

`?page=1&pageSize=20` 形式。レスポンス:
```json
{
  "items": [...],
  "total": 123,
  "page": 1,
  "pageSize": 20,
  "hasMore": true
}
```

メッセージのみ cursor based（`?before=ISO`）。

### 検索パラメータ（/jobs）

| パラメータ | 説明 |
|---|---|
| `q` | フリーワード |
| `prefectures` | カンマ区切り |
| `category` | 単一 |
| `employmentType` | 単一 |
| `salary` | `min-max` 形式（年収万円） |
| `sort` | `new` (デフォルト) / `pv` / `recommend` |

## 認証エラーの取り扱い

クライアント実装の推奨パターン:

```kotlin
// Retrofit + OkHttp Authenticator
suspend fun call() {
  try {
    api.someEndpoint()
  } catch (e: HttpException) {
    if (e.code() == 401) {
      // refresh を試みる
      val res = api.refresh(refreshToken)
      tokenStore.save(res.accessToken, res.refreshToken)
      api.someEndpoint()  // リトライ
    }
  }
}
```

`AuthInterceptor` でヘッダーを自動付与している。401 ハンドリングは別途 `Authenticator` で実装する（Phase 2 対応予定）。

## レート制限

現状なし。将来的に Cloudflare 等で導入予定。

## 国際化

レスポンスメッセージは日本語固定。`Accept-Language` ヘッダーは現状無視。

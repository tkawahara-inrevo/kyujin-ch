# Push 通知仕様

## 全体フロー

```
[1] アプリ起動 → FCM トークン取得
[2] トークンをサーバーに登録 (POST /api/v1/me/devices)
[3] サーバー (Web) で何かイベント発生 (例: 企業がメッセージ送信)
[4] サーバー → FCM v1 HTTP API でメッセージ送信
[5] FCM → 該当端末にプッシュ
[6] PushService.onMessageReceived 受信
[7] NotificationHelper で通知表示
[8] 通知タップ → MainActivity 起動 + Intent extra "deepLink"
[9] DeepLinkBus → 該当画面遷移
```

## クライアント側

### トークン管理

- `core/notification/FcmTokenManager.kt`
- 起動時・ログイン直後に呼ぶ
- ANDROID_ID を deviceId として利用
- POST `/api/v1/me/devices` で登録

### 通知受信

- `core/notification/PushService.kt`
- `FirebaseMessagingService` 継承
- `onMessageReceived` で `NotificationHelper.show` 呼出

### 通知表示

- `core/notification/NotificationHelper.kt`
- チャンネル定義:
  - `general`: 一般通知 (importance: DEFAULT)
  - `messages`: メッセージ通知 (importance: HIGH + バイブ)
- タイトル + 本文 + 通知アイコン
- タップ → MainActivity (singleTop) + `deepLink` Intent extra

### Deep Link

- `core/notification/DeepLinkBus.kt`
- SharedFlow で MainActivity → Composable に伝達
- 形式:
  - `thread/{id}` → スレッド詳細
  - `job/{id}` → 求人詳細
  - `applications` → 応募一覧
  - `messages` → メッセージタブ

## サーバー側

### 送信ライブラリ

- `lib/push.ts`
- FCM v1 HTTP API + service account JWT 認証
- 環境変数:
  - `FIREBASE_SERVICE_ACCOUNT_JSON` (推奨, JSON 文字列)
  - または `FIREBASE_PROJECT_ID` + `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY`

### 送信タイミング

| イベント | 送信先 | data フィールド | ファイル |
|---|---|---|---|
| 企業 → 応募者メッセージ | 応募者 | `type=message`, `threadId`, `deepLink=thread/{id}` | `app/actions/company/applicants.ts` |

### 拡張予定 (TODO)

- 応募ステータス変更 (通過/不採用)
- お気に入り求人の更新
- 新着求人 (希望条件マッチ時)

### 失敗時の挙動

- 404/400: 無効トークン → DB から自動削除
- その他のエラー: ログ出力のみ (フローは止めない)

## メッセージ形式

### Data メッセージ (推奨)

```json
{
  "message": {
    "token": "<FCM_TOKEN>",
    "data": {
      "title": "新着メッセージ",
      "body": "企業からメッセージが届きました",
      "type": "message",
      "deepLink": "thread/abc123",
      "threadId": "abc123"
    },
    "notification": {
      "title": "新着メッセージ",
      "body": "企業からメッセージが届きました"
    },
    "android": {
      "priority": "HIGH"
    }
  }
}
```

- `notification` フィールド: アプリがバックグラウンド時に OS が自動表示
- `data` フィールド: アプリがフォアグラウンド時に `onMessageReceived` で受信
- 両方付けることで両ケースに対応

## テスト方法

### 1. Firebase コンソールから手動送信

1. Firebase Console → Messaging
2. 「最初のキャンペーンを作成」→ Firebase Notification messages
3. タイトル/本文入力 → 端末選択 (FCM トークン指定可)
4. 送信

### 2. サーバー API 経由 (本番フロー)

1. takarさんアカウントでアプリログイン
2. テスト企業として代理ログイン (Web)
3. 応募者管理 → メッセージ送信
4. → アプリに通知バナー表示

### 3. デバッグ用 curl

```bash
ACCESS_TOKEN=$(node -e "...")
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": {"token": "<TOKEN>", "data": {"title": "test", "body": "test"}}}' \
  "https://fcm.googleapis.com/v1/projects/kyujin-ch/messages:send"
```

# Analytics イベント定義

Firebase Analytics で記録するイベント。`core/analytics/Analytics.kt` 経由で送信。

## ヘルパ関数 → イベント名 対応

| メソッド | イベント名 (Firebase) | パラメータ | 送信タイミング |
|---|---|---|---|
| `logLogin(method)` | `login` (標準) | `method` | ログイン成功時 |
| `logRegister(method)` | `sign_up` (標準) | `method` | 新規登録成功時 |
| `logViewJob(jobId, source)` | `select_content` (標準) | `content_type=job`, `item_id`, `source` | 求人詳細画面表示時 |
| `logFavoriteToggle(jobId, isFavorite)` | `favorite_add` / `favorite_remove` | `item_id` | ハート押下時 |
| `logApply(jobId, source)` | `apply_job` | `item_id`, `source=detail|swipe` | 応募成功時 |
| `logSwipe(jobId, direction)` | `swipe_card` | `item_id`, `direction=left|right` | スワイプ操作時 |
| `logSendMessage(threadId)` | `send_message` | `thread_id` | メッセージ送信成功時 |
| `logSearch(query, filterCount)` | `search` (標準) | `search_term`, `filter_count` | 検索実行時 |
| `logScreenView(screenName)` | `screen_view` (標準) | `screen_name` | 画面遷移時 |

## 統合済 ViewModel

- `AuthViewModel` (login)
- `RegisterViewModel` (sign_up)

## TODO: 統合する ViewModel

- `JobDetailViewModel` → logViewJob, logFavoriteToggle
- `ApplyViewModel` → logApply (source=detail)
- `SwipeViewModel` → logSwipe, logApply (source=swipe)
- `SearchViewModel` → logSearch
- `ThreadDetailViewModel` → logSendMessage
- 全画面 → logScreenView (LaunchedEffect)

## 確認方法

1. Firebase Console → Analytics → Realtime
2. 30 分以内にイベントが反映される
3. デバッグモード有効化: `adb shell setprop debug.firebase.analytics.app jp.kyujinch.app`

## ユーザー属性

将来追加検討:
- `user_role` (USER/COMPANY/ADMIN)
- `is_premium`
- `signup_date`

## イベント設計方針

- **標準イベント優先**: GA4 標準イベントを使うと既製レポートが使える
- **カスタムイベント**: 標準にないものだけ (例: swipe_card)
- **PII を絶対に送らない**: メアド・氏名・電話・住所は禁止
- **userId 等の識別子**: Firebase の internal user ID で代替できるので不要

# 画面一覧

各画面のルート名・ファイル・主な役割。

## ルートナビゲーション

```
LoginScreen ⇔ MainShell
              │
              ├── タブ群 (ボトムナビ表示)
              │   ├── HomeScreen
              │   ├── ApplicationsListScreen
              │   ├── ThreadsListScreen
              │   └── ProfileScreen
              │
              └── 非タブ画面 (上から push)
                  ├── SearchScreen
                  ├── JobDetailScreen
                  ├── ApplyScreen
                  ├── ThreadDetailScreen
                  ├── FavoritesScreen
                  ├── EditProfileScreen
                  ├── ResumeScreen
                  ├── BlocksScreen
                  ├── SwipeScreen
                  ├── WebContentScreen (利用規約/プライバシー)
                  └── RegisterScreen (LoginScreenから)
```

## ルート定義

| Route | 画面 | ファイル |
|---|---|---|
| `login` | ログイン | `feature/auth/LoginScreen.kt` |
| `register` | 新規登録 | `feature/auth/RegisterScreen.kt` |
| `home` | ホーム | `feature/home/HomeScreen.kt` |
| `search` | 検索 | `feature/search/SearchScreen.kt` |
| `applications` | 応募一覧 | `feature/applications/ApplicationsListScreen.kt` |
| `messages` | メッセージスレッド一覧 | `feature/messages/ThreadsListScreen.kt` |
| `profile` | マイページ | `feature/profile/ProfileScreen.kt` |
| `edit-profile` | プロフィール編集 | `feature/profile/EditProfileScreen.kt` |
| `resume` | 履歴書編集 | `feature/resume/ResumeScreen.kt` |
| `favorites` | お気に入り一覧 | `feature/favorites/FavoritesScreen.kt` |
| `blocks` | ブロック中のユーザー | `feature/blocks/BlocksScreen.kt` |
| `terms` | 利用規約 (WebView) | `feature/settings/WebContentScreen.kt` |
| `privacy` | プライバシーポリシー (WebView) | `feature/settings/WebContentScreen.kt` |
| `swipe` | マッチング (スワイプ) | `feature/swipe/SwipeScreen.kt` |
| `jobs/{id}` | 求人詳細 | `feature/jobs/JobDetailScreen.kt` |
| `apply/{id}` | 応募フォーム | `feature/applications/ApplyScreen.kt` |
| `threads/{id}` | スレッド詳細 | `feature/messages/ThreadDetailScreen.kt` |

## ボトムナビ (Web の MobileNavBar と統一)

| タブ | アイコン | ルート |
|---|---|---|
| マイページ | Person | `profile` |
| 応募済み | Article | `applications` |
| 気になる | Favorite | `favorites` |
| メッセージ | Message | `messages` |

※ アクティブ色: `#EB0937`, 非アクティブ: `#AAA`

## 画面遷移パターン

### ホーム → 詳細
- ホームの求人カードタップ → `jobs/{id}` (push)
- 「本日のおすすめ」バナー → `swipe`
- カテゴリ → `search`

### 詳細 → 応募
- 「応募する」ボタン → `apply/{id}`
- 応募完了 → `applications` (popUpTo home)

### マイページから
- 「プロフィールを編集」 → `edit-profile`
- 「履歴書を編集」 → `resume`
- 「お気に入り一覧」 → `favorites` (バック有)
- 「ブロック中のユーザー」 → `blocks`
- 「利用規約」「プライバシーポリシー」 → WebContentScreen

### 通知から
- 通知タップ → MainActivity Intent extra `deepLink`
- DeepLinkBus → 該当画面に push
- 例: `thread/{id}` → ThreadDetailScreen

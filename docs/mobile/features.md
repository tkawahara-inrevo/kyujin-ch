# 機能仕様

各機能の挙動を網羅。

## 認証

### ログイン
- ファイル: `feature/auth/LoginScreen.kt`
- メアド + パスワードで POST `/api/v1/auth/login`
- 成功時:
  - accessToken (15分) と refreshToken (30日) を DataStore に保存
  - FCM トークンを取得してサーバーに登録 (`/me/devices`)
  - Analytics: `login` イベント
  - ホーム画面に遷移

### 新規会員登録
- ファイル: `feature/auth/RegisterScreen.kt`
- 氏名・メアド・パスワード(+確認) + 規約同意
- POST `/api/v1/auth/register`
- 成功時:
  - 自動ログイン
  - FCM トークン登録
  - Analytics: `sign_up` イベント

### 自動ログイン
- アプリ起動時、DataStore の accessToken が存在すれば main 画面へ
- 期限切れは API 呼び出し時に自動 refresh (TokenAuthenticator)

### トークン自動リフレッシュ
- 401 を受けたら refresh token で `/auth/refresh` を叩く
- リフレッシュも失敗したらトークンクリア → 次回起動時にログイン画面

### ログアウト・退会
- マイページの「ログアウト」「退会する」ボタン
- 退会は確認ダイアログ → DELETE `/me` → トークンクリア → ログイン画面

## 求人閲覧

### ホーム
- ファイル: `feature/home/HomeScreen.kt`
- 構成:
  - ブランドヘッダー（「求人ちゃんねる」+ 中途バッジ）
  - ヒーローバナー（Web `FV_fix-sp.png` 表示）
  - 🎯 本日のおすすめ求人バナー（スワイプ画面への入口）
  - カテゴリグリッド（横スクロール、14カテゴリ）
  - 「注目の求人」セクション（PV順 6件）
  - 「新着求人」セクション（新着順 6件、注目と重複除外）
- Pull-to-refresh 対応

### 求人詳細
- ファイル: `feature/jobs/JobDetailScreen.kt`
- 構造:
  - メイン画像 (aspect 1.85:1)
  - タイトル・会社名・タグ
  - 募集要項セクション（青ヘッダー + InfoRow）
  - 仕事内容・応募条件・休日休暇・福利厚生・選考フロー
- 上部: お気に入りトグル、メニュー (通報)
- 下部: 「応募する」ボタン (応募済みは disabled)
- PV カウント自動送信

### 検索
- ファイル: `feature/search/SearchScreen.kt`
- キーワード検索 + フィルタ（都道府県/カテゴリ/雇用形態）
- ソート切替（新着/人気/おすすめ）
- 検索履歴（最大10件、DataStore で永続化）

### マッチング (スワイプ式)
- ファイル: `feature/swipe/SwipeScreen.kt`
- データ: `/jobs/recommended`
- ジェスチャ:
  - **右スワイプ** = 応募 (プロフィール完全性チェックあり)
  - **左スワイプ** = スキップ (やり直し不可)
  - **長押し** = 詳細 ModalBottomSheet 表示 (画面遷移なし)
- 下部: ✕ スキップ / ✓ 応募 FAB
- スワイプ中: 方向に応じて「応募」「スキップ」オーバーレイ表示

## 応募・メッセージ

### 応募
- ファイル: `feature/applications/ApplyScreen.kt`
- 志望動機（任意）入力 → POST `/applications`
- プロフィール完全性チェック: 氏名・電話・都道府県必須
- 未完なら編集画面誘導ダイアログ
- 成功時、応募一覧画面に遷移

### 応募一覧
- ファイル: `feature/applications/ApplicationsListScreen.kt`
- 応募一覧 + ステータスバッジ（未読/既読/通過/不採用）
- 詳細画面から戻ったときに自動リロード (OnResume)
- Pull-to-refresh 対応

### メッセージスレッド一覧
- ファイル: `feature/messages/ThreadsListScreen.kt`
- 応募ごとのスレッド + 未読カウントバッジ
- スレッド詳細から戻ったときに自動リロード (OnResume)

### メッセージ詳細 (チャット)
- ファイル: `feature/messages/ThreadDetailScreen.kt`
- LINE 風チャット UI
- 入力欄 + 送信ボタン
- 開いた瞬間に既読化 POST `/threads/{id}/read`
- 新着メッセージ受信時に自動スクロール

## プロフィール

### マイページ
- ファイル: `feature/profile/ProfileScreen.kt`
- アバター + 氏名 + メアド表示
- 基本情報カード
- 生体認証 トグル
- ボタン: プロフィール編集 / 履歴書編集 / お気に入り一覧 / ブロック中ユーザー / 利用規約 / プライバシーポリシー
- バージョン情報表示
- ログアウト / 退会

### プロフィール編集
- ファイル: `feature/profile/EditProfileScreen.kt`
- アバター画像アップロード (PickVisualMedia → multipart)
- 氏名・フリガナ・電話・住所
- メール通知 ON/OFF
- PATCH `/me`

### 履歴書編集
- ファイル: `feature/resume/ResumeScreen.kt`
- 自己PR / 希望条件 (テキストエリア)
- 学歴・職歴・資格 (動的に追加・削除)
- PATCH `/me/resume` で全置換保存

## その他

### お気に入り一覧
- ファイル: `feature/favorites/FavoritesScreen.kt`
- ❤️ アイコンタップで解除可
- Pull-to-refresh 対応

### ブロック中のユーザー
- ファイル: `feature/blocks/BlocksScreen.kt`
- 一覧 + 「解除」ボタン

### 通報
- 求人詳細の右上メニュー「通報する」
- 共通 ReportDialog: 理由選択 + 詳細記入
- POST `/reports`

### 利用規約・プライバシーポリシー
- ファイル: `feature/settings/WebContentScreen.kt`
- WebView でアプリ内表示
- `https://kyujin-ch.jp/kiyaku` / `/privacy`
- Web 側の更新が自動反映

### Push 通知
- 詳細: [push-notification.md](./push-notification.md)
- 通知タップで該当スレッドが直接開く (Deep Link)

### 生体認証
- マイページからトグル ON
- 起動時に指紋・顔認証プロンプト
- キャンセル時はアプリ終了

### Splash 画面
- ブランドカラー (#2F6CFF) 背景 + アプリアイコン
- Android 12+ SplashScreen API

## 共通ロジック

### Pull-to-refresh
- `core/ui/PullRefresh.kt`
- Material3 PullToRefreshBox ラッパ
- Home / 検索 / お気に入り / 応募 / メッセージで使用

### エラー UI
- `core/ui/ErrorView.kt`
- エラーアイコン + メッセージ + 再試行ボタン

### 自動リトライ
- `core/network/RetryInterceptor.kt`
- GET の 5xx / IOException で最大2回、指数バックオフ (300ms, 600ms)
- 4xx (401/403/404/422 等) は即諦め

### 画面遷移アニメーション
- NavHost に enterTransition / exitTransition 設定
- push: スライド(1/4) + フェード, pop: 逆向き
- 期間 180-220ms

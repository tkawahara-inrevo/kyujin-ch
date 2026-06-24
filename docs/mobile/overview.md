# 全体像

## 採用技術

| 領域 | 採用 | バージョン |
|---|---|---|
| 言語 | Kotlin | 2.0.21 |
| UI | Jetpack Compose | BOM 2024.12 |
| デザインシステム | Material 3 | (BOM 内) |
| DI | Hilt | 2.52 |
| HTTP | Retrofit + OkHttp | 2.11 / 4.12 |
| JSON | kotlinx.serialization | 1.7 |
| 永続化 | DataStore Preferences | 1.1 |
| 画像 | Coil | 2.7 |
| 認証 | 自作JWT (jose) + Bearer | - |
| Push | Firebase Cloud Messaging | BOM 33.7 |
| 分析 | Firebase Analytics | BOM 33.7 |
| クラッシュ収集 | Firebase Crashlytics | BOM 33.7 |
| 生体認証 | AndroidX Biometric | 1.1 |
| Splash | AndroidX SplashScreen | 1.0 |

## アーキテクチャ

```
MVVM + 単方向データフロー

┌────────────────────────────────────────────┐
│ UI Layer (Composable)                      │
│ - 画面ごとの Screen.kt                       │
│ - ViewModel から StateFlow で状態購読        │
└──────────────────┬─────────────────────────┘
                   │ ユーザー操作 → fun call
                   │ 状態変更 → StateFlow update
┌──────────────────▼─────────────────────────┐
│ ViewModel (HiltViewModel)                  │
│ - 各画面の状態保持・ロジック                  │
│ - Repository / API を呼ぶ                   │
│ - StateFlow<UiState> を公開                 │
└──────────────────┬─────────────────────────┘
                   │
┌──────────────────▼─────────────────────────┐
│ Repository / API / DataStore               │
│ - KyujinchApi (Retrofit)                   │
│ - AuthTokenStore (DataStore)                │
│ - BiometricStore (DataStore)                │
│ - SearchHistoryStore (DataStore)            │
│ - FcmTokenManager                           │
└────────────────────────────────────────────┘
```

## ディレクトリ構成

```
android/app/src/main/kotlin/jp/kyujinch/app/
├── KyujinchApp.kt          # @HiltAndroidApp
├── MainActivity.kt         # ルートナビゲーション
│
├── core/                   # 横断的な機能
│   ├── analytics/          # Firebase Analytics ラッパ
│   ├── auth/               # トークン保存・生体認証
│   ├── data/               # DataStore (検索履歴等)
│   ├── network/            # Retrofit API + Interceptor
│   ├── notification/       # FCM + DeepLink
│   └── ui/                 # 共通 Composable (ErrorView, PullRefresh, JobCard 等)
│
├── feature/                # 機能単位
│   ├── auth/               # ログイン・新規登録
│   ├── home/               # ホーム画面
│   ├── search/             # 検索画面
│   ├── jobs/               # 求人詳細
│   ├── applications/       # 応募・応募一覧
│   ├── favorites/          # お気に入り一覧
│   ├── messages/           # スレッド一覧・詳細
│   ├── profile/            # マイページ・プロフィール編集
│   ├── resume/             # 履歴書編集
│   ├── blocks/             # ブロックユーザー管理
│   ├── settings/           # 利用規約・プライバシー (WebView)
│   └── swipe/              # マッチング (スワイプ)
│
├── di/                     # Hilt モジュール (NetworkModule 等)
└── ui/theme/               # 共通テーマ・カラー・タイポ
```

## ナビゲーション戦略

- ルート: `LoginScreen` ⇔ `MainShell`
- MainShell: 5 タブのボトムナビ + 全画面遷移
- タブ: ホーム / 検索 / 応募済み (※) / 気になる / メッセージ / マイページ
  - ※ Web の MobileNavBar に合わせて **4 タブ構成** (マイページ/応募済み/気になる/メッセージ)
  - ホーム/検索はタブには無く、ホームから検索画面に遷移する形

## デザイン方針

- **Web のスマホ表示と統一**: カラー・タイポグラフィ・カード形状・余白を Web 側と一致
- 詳細は [feedback_mobile_design.md](../../C:/Users/takar/.claude/projects/...) でメモ済

## 環境

- minSdk: 26 (Android 8.0)
- targetSdk: 35 (Android 14)
- パッケージ名: `jp.kyujinch.app`
- API ベース URL: `https://kyujin-ch.jp/api/v1/`

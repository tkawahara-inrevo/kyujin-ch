# 求人ちゃんねる Android アプリ

`/api/v1/*` を叩いて動作するネイティブ Android アプリ（Kotlin + Jetpack Compose）。

## 技術スタック

- Kotlin 2.0.21
- Jetpack Compose (BOM 2024.12)
- Material 3
- Hilt（DI）
- Retrofit + OkHttp + kotlinx-serialization
- DataStore Preferences（認証トークン保存）
- Coil（画像読込）
- AndroidX Biometric（Face ID/指紋）
- Firebase Cloud Messaging（Push）

## セットアップ

1. **Android Studio**: Ladybug 以降（Gradle 8.7.3 / AGP 8.7.3 / Kotlin 2.0.21）
2. **JDK 17**: Android Studio 同梱で OK
3. **Firebase**:
   - Firebase コンソールで `jp.kyujinch.app` プロジェクトを作成
   - `google-services.json` をダウンロードして `android/app/` 直下に配置
   - `google-services.json` は `.gitignore` 対象
4. **Gradle 同期**: Android Studio で `android/` フォルダを開き、Gradle 同期実行

## ビルド

```bash
cd android
./gradlew assembleDebug   # デバッグ APK
./gradlew installDebug    # 接続中の実機/エミュレータにインストール
```

## ディレクトリ構成

```
android/
├── app/
│   └── src/main/kotlin/jp/kyujinch/app/
│       ├── KyujinchApp.kt           # @HiltAndroidApp
│       ├── MainActivity.kt          # NavHost + Compose ルート
│       ├── core/
│       │   ├── auth/                # トークン管理 (DataStore)
│       │   ├── network/             # Retrofit API + models
│       │   └── notification/        # FCM 受信
│       ├── feature/
│       │   ├── auth/                # ログイン画面
│       │   ├── home/                # 求人一覧
│       │   └── ...
│       ├── ui/theme/                # Material3 テーマ
│       └── di/                      # Hilt モジュール
└── gradle/libs.versions.toml        # 依存バージョン一元管理
```

## 認証

- アクセストークン: 15分
- リフレッシュトークン: 30日
- DataStore Preferences `auth_tokens.xml` に保存（バックアップ除外）
- `AuthInterceptor` が全リクエストに `Authorization: Bearer ...` を付与

## API ベース URL

- Debug: `https://kyujin-ch.jp/api/v1/`
- Release: `https://kyujin-ch.jp/api/v1/`

ローカル開発時は `app/build.gradle.kts` の `buildConfigField` を編集。

## 次のステップ

1. Firebase コンソールで `google-services.json` 取得
2. Android Studio で `android/` を開いて Gradle 同期
3. エミュレータか実機で起動 → ログイン → 求人一覧の動作確認
4. 各画面の追加実装（応募・メッセージ・お気に入り・プロフィール）

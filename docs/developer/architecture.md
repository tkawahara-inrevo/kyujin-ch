# アーキテクチャ

## システム構成図

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  求職者ブラウザ  │    │   企業ブラウザ   │    │ 管理者ブラウザ  │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                       │
         └──────────────────────┼───────────────────────┘
                                ▼
                  ┌─────────────────────────┐
                  │ Lightsail (Next 13.159…)│
                  │  - Next.js 16           │
                  │  - PM2 で常駐           │
                  │  - HTTPS (Let's Encrypt)│
                  └────┬────────────────┬───┘
                       │                │
            ┌──────────┘                └──────────────┐
            ▼                                          ▼
   ┌────────────────┐                       ┌────────────────────┐
   │  RDS Postgres  │                       │  Lightsail (WP)    │
   │  本番DB        │                       │  - WordPress       │
   └────────────────┘                       │  - biz-column 公開 │
                                            └────────────────────┘

   ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
   │  AWS S3        │    │  AWS SES v2    │    │  Slack Webhook │
   │  画像 / PDF    │    │  メール送信    │    │  通知 (審査等) │
   └────────────────┘    └────────────────┘    └────────────────┘

   ┌──────────────────┐
   │ Android アプリ    │  → /api/v1/* (JWT)
   │ (Kotlin/Compose) │
   └──────────────────┘
```

## 採用技術詳細

### Web

| 役割 | 採用 | バージョン |
|---|---|---|
| フレームワーク | Next.js | 16.1.6 |
| UI | React | 19.2.3 |
| 認証 | NextAuth | v5 beta.30 |
| ORM | Prisma | 7.4 |
| スタイリング | Tailwind CSS | 4 |
| 言語 | TypeScript | 5 |
| 富テキスト | tiptap | 3.22 |
| PDF生成 | @react-pdf/renderer | 4.5 |
| Excel生成 | exceljs | 4.4 |
| HTTPクライアント | undici | 6.26 |

### モバイル（Android）

| 役割 | 採用 | バージョン |
|---|---|---|
| 言語 | Kotlin | 2.0.21 |
| UI | Jetpack Compose | BOM 2024.12 |
| DI | Hilt | 2.52 |
| HTTP | Retrofit + OkHttp | 2.11 / 4.12 |
| JSON | kotlinx.serialization | 1.7 |
| 永続化 | DataStore Preferences | 1.1 |
| Push | Firebase Cloud Messaging | 33.7 |
| 画像 | Coil | 2.7 |

### インフラ

| 役割 | 採用 |
|---|---|
| Web ホスト | AWS Lightsail (Ubuntu) |
| WP ホスト | AWS Lightsail (別インスタンス) |
| DB | AWS RDS PostgreSQL |
| ファイル保存 | AWS S3 |
| メール | AWS SES v2 |
| ドメイン | お名前.com |
| HTTPS | Let's Encrypt |

## ディレクトリ構成（Web 側）

```
app/
├── (公開ページ)         # 求職者向け
│   ├── page.tsx         # トップページ
│   ├── jobs/            # 求人一覧・詳細・応募
│   ├── companies/       # 企業ページ
│   ├── column/          # 求職者向けコラム
│   ├── focus/           # Focus 特集記事
│   ├── biz-column/      # 企業向けコラム (WP連携)
│   ├── mypage/          # マイページ
│   ├── messages/        # メッセージ
│   ├── applications/    # 応募管理
│   └── favorites/       # お気に入り
│
├── company/             # 企業管理画面
│   ├── jobs/            # 求人作成・編集
│   ├── applicants/      # 応募者管理
│   ├── messages/        # 企業 ↔ 求職者メッセージ
│   └── dashboard/       # ダッシュボード
│
├── admin/               # 運営管理画面
│   ├── jobs/            # 求人審査
│   ├── companies/       # 企業管理
│   ├── jobseekers/      # 求職者管理
│   ├── columns/         # コラム編集
│   ├── focus/           # Focus 特集編集
│   ├── billing/         # 請求単価管理
│   ├── invoices/        # 請求一覧
│   └── analytics/       # 分析
│
├── api/                 # API ルート
│   ├── auth/            # NextAuth コールバック
│   ├── v1/              # モバイル向け REST API
│   └── admin/           # 管理系 API
│
└── actions/             # Server Actions（Web側ロジック中心）
    ├── user/            # 求職者向け
    ├── company/         # 企業向け
    └── admin/           # 管理者向け

lib/                     # 共通ロジック
prisma/                  # スキーマ・マイグレーション
components/              # 共有コンポーネント
docs/                    # ドキュメント (本ディレクトリ)
android/                 # Android アプリ
```

## データフロー例

### 求職者の応募フロー

```
求職者 (ブラウザ)
  → POST /jobs/[id]/apply (Server Action)
    → applications テーブル INSERT
    → conversations テーブル UPSERT
    → SES でメール通知（企業へ）
    → Slack 通知（運営）
  → 求職者画面に「応募完了」表示
```

### モバイルアプリの認証フロー

```
モバイルアプリ
  → POST /api/v1/auth/login {email, password}
    → bcrypt 検証
    → JWT (access 15分) 発行
    → refreshToken (30日, DB保存) 発行
    → ↩️ tokens 返却
  → 以降 Authorization: Bearer <access> で API 叩く
  → access 期限切れたら POST /api/v1/auth/refresh
```

### 求人の審査フロー

```
企業
  → 求人作成 (createJob)
    → reviewStatus=PENDING_REVIEW
    → Slack 通知（運営）
    → JobReviewLog 記録

運営
  → /admin/jobs/[id] で確認
  → approveJob → reviewStatus=PUBLISHED, isPublished=true → 公開
  または
  → returnJob → reviewStatus=RETURNED → 企業に差し戻し
```

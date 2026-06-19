# 開発者向けドキュメント

求人ちゃんねる (kyujin-ch.jp) の開発者向け資料の入口。

## 全体像

求人媒体 SaaS。3 つのロール（求職者・企業・管理者）が利用する。

- **本番 URL**: https://kyujin-ch.jp
- **リポジトリ構成**: モノレポ
  - Web（Next.js 16）: ルート
  - Android アプリ（Kotlin + Compose）: `android/`
- **インフラ**: AWS Lightsail（Next 本体）+ Lightsail（WordPress: WP 連携）+ RDS PostgreSQL

## ドキュメント一覧

| ファイル | 内容 |
|---|---|
| [architecture.md](./architecture.md) | システム構成・採用技術 |
| [data-model.md](./data-model.md) | Prisma スキーマ解説・主要テーブル関係 |
| [auth-flow.md](./auth-flow.md) | NextAuth（Web）+ JWT（モバイル）認証の動作 |
| [server-actions.md](./server-actions.md) | Web 側 Server Actions の一覧 |
| [rest-api.md](./rest-api.md) | モバイル向け `/api/v1/*` REST API のサマリ |
| [deployment.md](./deployment.md) | Lightsail へのデプロイ手順 |
| [environment.md](./environment.md) | 環境変数一覧 |
| [conventions.md](./conventions.md) | コーディング規約・命名規則 |

## 主要技術

| 領域 | 採用 |
|---|---|
| Web フレームワーク | Next.js 16 (App Router) + React 19 |
| 認証 (Web) | NextAuth v5（Credentials + Google） |
| 認証 (Mobile) | 自作 JWT (HS256, jose) |
| DB | PostgreSQL (AWS RDS via Lightsail) |
| ORM | Prisma 7 |
| スタイリング | Tailwind 4 |
| ストレージ | AWS S3 |
| メール | AWS SES v2 |
| 通知 | Slack Webhook |
| モバイル | Kotlin + Jetpack Compose + Hilt + Retrofit + FCM |
| プロセス管理 | PM2（本番） |

## はじめての開発者の最初のステップ

1. リポを clone
2. [environment.md](./environment.md) で必要な環境変数を `.env` に設定
3. `npm install` → `npx prisma migrate dev` → `npm run dev`
4. localhost:3000 で起動確認
5. テストデータ投入は `npm run seed:scenario-test`

## ユーザー向けマニュアル

- [求職者マニュアル](../user/jobseeker-manual.md)
- [企業マニュアル](../user/company-manual.md)
- [管理者マニュアル](../user/admin-manual.md)

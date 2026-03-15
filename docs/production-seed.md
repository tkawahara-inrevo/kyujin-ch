# Production-Like Seed

本番っぽい検証データをまとめて入れ直すためのメモです。

## 入るデータ

- 管理者: 1件
- テスト用求職者: 1件
- 企業担当ユーザー: 100件
- 企業: 100件
- 求人: 300件
- 応募 / メッセージ / PV / 請求 / レビュー: 画面確認に必要な分を自動生成

## ログイン情報

- 管理者
  - `admin@kyujin-ch.com`
  - `Admin1234!`
- テスト用求職者
  - `tester@kyujin-ch.com`
  - `User1234!`
- 企業担当
  - `company001@kyujin-ch.com` 〜 `company100@kyujin-ch.com`
  - `Company1234!`

## 実行前の注意

- このスクリプトは共有DBの主要データを削除してから再作成します。
- `PriceEntry` は残しますが、ユーザー・企業・求人・応募・メッセージ・請求系は入れ直します。
- 念のため `.env` の `DATABASE_URL` が本当に対象DBを向いているか確認してください。

## 実行コマンド

```powershell
cmd /c npm run seed:production-like
```

PowerShell の実行ポリシーに引っかかる場合は、`cmd /c` を付けるのが安全です。

## 実行後の確認ポイント

```bash
npx prisma studio
```

- `User` に `admin@kyujin-ch.com` と `tester@kyujin-ch.com` がいる
- `Company` が100件ある
- `Job` が300件ある
- 各求人に `imageUrl`, `benefits`, `selectionProcess`, `requirements` が入っている

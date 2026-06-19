# デプロイ手順

## 本番環境

- **Next 本体**: AWS Lightsail Ubuntu インスタンス `13.159.236.233`
- **WP (biz-column 連携)**: AWS Lightsail Ubuntu インスタンス `18.179.136.107`
- **DB**: 同 Lightsail 内 PostgreSQL or RDS
- **ドメイン**: お名前.com
- **HTTPS**: Let's Encrypt（certbot）

## SSH 接続

```bash
ssh -i ~/path/to/prod_key.pem ubuntu@13.159.236.233
```

開発者の手元では SSH 鍵を `e:/tmp/prod_key.pem` 等に配置。

## 通常デプロイ

```bash
ssh -i e:/tmp/prod_key.pem ubuntu@13.159.236.233 \
  "cd ~/kyujin-ch && \
   git pull origin main && \
   npm run build && \
   pm2 reload kyujin-ch"
```

- `npm run build` は `prisma generate && next build` を実行
- `pm2 reload` でゼロダウンタイム再起動

## DBマイグレーションが必要なとき

```bash
ssh -i e:/tmp/prod_key.pem ubuntu@13.159.236.233 \
  "cd ~/kyujin-ch && \
   git pull origin main && \
   npx prisma migrate deploy && \
   npm run build && \
   pm2 reload kyujin-ch"
```

⚠️ `npx prisma migrate deploy` は新しいマイグレーションを順次適用するだけ（リセットしない）。
⚠️ 破壊的マイグレーションを含む場合、事前に DB バックアップを取ること。

## PM2 管理

```bash
# プロセス確認
pm2 list

# ログ確認
pm2 logs kyujin-ch
pm2 logs kyujin-ch --lines 200

# 再起動（ダウンタイムあり）
pm2 restart kyujin-ch

# 再起動（ダウンタイムなし、推奨）
pm2 reload kyujin-ch

# 起動設定保存（PC 再起動時にも自動起動）
pm2 save
```

## 環境変数

本番の環境変数は `~/kyujin-ch/.env` に配置。詳細は [environment.md](./environment.md) 参照。
編集後は `pm2 reload kyujin-ch` で再読込。

## HTTPS 証明書更新

Let's Encrypt は90日有効。certbot で自動更新が cron 設定済み:

```bash
# 確認
sudo certbot certificates

# 手動更新
sudo certbot renew --nginx
```

## Nginx 設定

`/etc/nginx/sites-available/kyujin-ch.jp` で:
- `kyujin-ch.jp` および `www.kyujin-ch.jp` を Next (port 3000) にプロキシ
- HTTP → HTTPS リダイレクト

```bash
# 設定確認
sudo nginx -t

# リロード
sudo systemctl reload nginx
```

## WordPress 連携 (biz-column)

WPは別インスタンス `18.179.136.107`。Next から undici で fetch して内容を取り込む（SSR）。

```typescript
// lib/biz-column.ts
const agent = new undici.Agent({ connect: { rejectUnauthorized: false } });
await fetch("https://wp.kyujin-ch.jp/wp-json/wp/v2/posts", { dispatcher: agent });
```

⚠️ wp.kyujin-ch.jp の証明書は SAN ミスマッチがあるため `rejectUnauthorized: false` で回避。
将来的に正しい証明書を入れたら削除予定。

## ロールバック

```bash
# 直前のコミットに戻す
ssh -i e:/tmp/prod_key.pem ubuntu@13.159.236.233 \
  "cd ~/kyujin-ch && \
   git reset --hard HEAD~1 && \
   npm run build && \
   pm2 reload kyujin-ch"
```

⚠️ マイグレーションを含むコミットをロールバックする場合、DB スキーマを手動で戻す必要あり。
基本的には **roll-forward**（新しい修正コミットを上から積む）を推奨。

## 監視

- アプリログ: `pm2 logs kyujin-ch`
- Nginx ログ: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- システムメトリクス: Lightsail コンソール

将来的に CloudWatch / Sentry 等を導入予定（現状未対応）。

## バックアップ

DB は AWS Lightsail/RDS の自動スナップショット機能を利用。
S3 はバージョニング有効化済。

## ステージング環境

**現在は無し**。本番に直接デプロイする運用。
変更は scoping を厳格に、影響範囲を限定してデプロイする。

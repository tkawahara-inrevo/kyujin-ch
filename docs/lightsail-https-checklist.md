# Lightsail HTTPS Checklist

対象ドメイン: `kyujin-ch.com`

## 先に決めること

- 正式URLを `https://kyujin-ch.com` にするか
- `https://www.kyujin-ch.com` も使うか

このプロジェクトでは、まず `https://kyujin-ch.com` を正にして、必要なら `www` を追加するのがおすすめ。

## AWS 側の手順

1. Route 53 のドメイン登録完了を待つ
2. 登録者確認メールが来ていたら承認する
3. Lightsail で Load Balancer を作成する
4. Load Balancer に本番インスタンスをアタッチする
5. Lightsail の `Custom domains` で証明書を作成する
6. `kyujin-ch.com` を Load Balancer に向ける DNS レコードを作る
7. 必要なら `www.kyujin-ch.com` も追加する
8. 証明書を Load Balancer にアタッチする
9. `http://kyujin-ch.com` と `https://kyujin-ch.com` の疎通を確認する

## Route 53 で作る想定レコード

最低限:

- `A` レコード
- レコード名: 空欄または `@`
- Alias: `ON`
- ルーティング先: Lightsail Load Balancer

`www` も使うなら:

- `A` レコード
- レコード名: `www`
- Alias: `ON`
- ルーティング先: Lightsail Load Balancer

## アプリ側で本番切替時に確認する env

このリポジトリで本番URLに関係する env 名:

- `AUTH_URL`
- `NEXTAUTH_URL`
- `AUTH_TRUST_HOST`

本番では概ね以下にそろえる:

```env
AUTH_URL=https://kyujin-ch.com
NEXTAUTH_URL=https://kyujin-ch.com
AUTH_TRUST_HOST=true
```

`www` を正式URLにするなら、上の URL 部分を `https://www.kyujin-ch.com` に統一する。

## デプロイ後の確認ポイント

- ログインできる
- ログアウトできる
- 応募できる
- メッセージ添付をダウンロードできる
- 管理画面と企業画面でセッション切れが起きない

## 今回すでに対応済みのこと

- 添付ダウンロードは、S3 への外部リダイレクトではなく、自サイトの API から直接返す方式に変更済み
- そのため HTTPS 化後は、ブラウザの unsafe download 判定がかなり起きにくくなる見込み

## 作業メモ

- Route 53 のドメイン登録リージョンが `グローバル` なのは正常
- Lightsail Load Balancer は本番インスタンスと同じリージョンで作る
- Load Balancer 作成後は、インスタンス側の公開 URL ではなく、ドメイン経由で確認する

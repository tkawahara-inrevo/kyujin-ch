# 障害調査レポート：3/26 WP管理画面アクセス不能・データ消失事象

**作成日：** 2026-04-06  
**調査対象期間：** 2026-03-26 11:00〜14:00 JST  
**調査者：** tkawahara-inrevo

---

## 1. 事象の経緯

| 時刻（JST） | 出来事 |
|---|---|
| 11:30頃 | 外部ベンダーが公開作業を完了。その過程で WP 管理画面 URL を `wp-admin` から `kc-login` に変更 |
| 12:00頃 | ベンダーより公開完了の報告 |
| 13:20頃 | 自社社員（武井様）より管理画面にアクセスできないとご連絡 |
| 13:45頃 | 自社社員（小林様）よりデータ消失についてご連絡 |

---

## 2. 調査結果

### 原因：WPS Hide Login プラグインによる `wp-login.php` ブロック

**キャッシュ（WP/AWS）は関係ありません。**

---

## 3. ログ証拠

### 3-1. URL変更の確認（UTC 02:00 = JST 11:00）

```
14.11.164.34  [26/Mar/2026:02:00:24]  POST /wp-admin/options.php  302
14.11.164.34  [26/Mar/2026:02:00:24]  GET  /wp-admin/options-general.php?settings-updated=true  200
14.11.164.34  [26/Mar/2026:02:22:50]  GET  /wp-admin/options.php?dismiss=new_admin_email  302
```

→ JST 11:00〜11:23 に `options.php` への POST（＝プラグイン設定保存）が記録されており、このタイミングで `whl_page = kc-login` が設定された。

### 3-2. 被害ユーザーの作業状況とセッション失効の経緯

```
59.132.17.165  [26/Mar/2026:01:29:58 〜 01:56:11]  POST /wp-admin/admin-ajax.php  200（2分おきに継続）
  ↓ 約37分間の空白（離席と推定）
59.132.17.165  [26/Mar/2026:02:33:33]  GET  /wp-json/elementor/v1/checklist/user-progress  200
59.132.17.165  [26/Mar/2026:02:33:58]  GET  /?page_id=96  200  ← Elementor編集再開
```

Elementor は `admin-ajax.php` への定期リクエスト（heartbeat）によってセッションを延命している。JST 10:56（UTC 01:56）を最後に heartbeat が途絶え、**37分間の空白**が生じた。この間にセッションの有効期限が消費され、JST 11:33（UTC 02:33）に編集を再開した時点でセッションは**期限切れに近い状態**だった。

URL変更後も既存のセッションクッキーは即座に無効化されないため、被害ユーザーはその後も引き続き Elementor での編集作業を継続できていた。

### 3-3. 障害発生の決定的ログ（UTC 04:04 = JST 13:04）

```
59.132.17.165  [26/Mar/2026:04:04:09]  POST /wp-admin/async-upload.php         302
59.132.17.165  [26/Mar/2026:04:04:09]  GET  /login/?redirect_to=...&reauth=1   200  ← 新URLのログイン画面
59.132.17.165  [26/Mar/2026:04:04:36]  GET  /wp-login.php?interim-login=1      404  ← ここで詰んだ
```

ファイルアップロードの操作タイミングでセッションが完全に切れ、WordPress が再認証（`wp-login.php?interim-login=1`）を要求した。しかし WPS Hide Login がこの URL をブロックし **404** を返したため、セッションが回復不能になった。

**補足：** 「ファイルアップロードが再認証を引き起こした」のではなく、「セッション期限が来たタイミングがたまたまファイルアップロード操作の瞬間だった」が正確な表現。通常のアップロード操作自体が再認証を要求することはない。

### 3-4. ログアウト状態での混乱（UTC 04:10〜 = JST 13:10〜）

```
59.132.17.165  [26/Mar/2026:04:10:32]  GET /wp-admin/post.php?post=96&action=elementor  302
59.132.17.165  [26/Mar/2026:04:11:41]  GET /wp-admin/  302
59.132.17.165  [26/Mar/2026:04:12:01]  GET /wp-admin/edit.php?post_type=post  302（複数回繰り返し）
```

→ ログアウト状態で wp-admin への直接アクセスを繰り返しているが、すべて 302 リダイレクト（ログインページへ）。この時点で未保存の Elementor 編集内容はすでに消失していた。

---

## 4. 障害メカニズム

```
【通常時】
Elementor編集中
→ セッション期限切れ
→ WordPress が wp-login.php?interim-login=1 を呼び出す
→ ブラウザ内 iframe でサイレント再認証
→ 作業継続

【WPS Hide Login 導入後（今回）】
Elementor編集中
→ セッション期限切れ（ファイルアップロードがトリガー）
→ WordPress が wp-login.php?interim-login=1 を呼び出す
→ WPS Hide Login が 404 を返す（wp-login.php へのアクセスをブロック）
→ 再認証不能 → 強制ログアウト
→ 未保存の Elementor 編集内容が消失
```

### なぜ1.5時間後に発生したか

WPS Hide Login は**既存のログインセッションを即座に無効化しない**。auth クッキーはそのまま生きているため、URL変更直後はまだ wp-admin にアクセスできていた。

また、Elementor の heartbeat（`admin-ajax.php` への2分おきのリクエスト）がセッションを延命し続けていたが、JST 10:56〜11:33 の**37分間の空白**（離席等）でセッションの有効期限が大きく消費された。その後、JST 13:04 のファイルアップロード時にセッションが完全に切れ、再認証フローが発動。`wp-login.php?interim-login=1` が WPS Hide Login に 404 でブロックされ問題が顕在化した。

---

## 5. キャッシュ起因説の否定

| 仮説 | 確認結果 |
|---|---|
| WP キャッシュプラグイン | プラグイン一覧に W3TC・WP Super Cache 等なし。`/wp-content/cache/` ディレクトリも存在しない → **非該当** |
| Elementor キャッシュ | CSS/JS のキャッシュであり認証とは無関係 → **非該当** |
| AWS キャッシュ（CloudFront 等） | アーキテクチャは nginx → Apache の直接プロキシ。CloudFront は使用していない → **非該当** |
| **WPS Hide Login による wp-login.php ブロック** | アクセスログで `404` を直接確認 → **確定原因** |

---

## 6. 現在の状態

- WPS Hide Login は現在も有効（`whl_page = kc-login`）
- 管理画面ログインは `https://kyujin-ch.jp/kc-login` から行う必要がある
- `https://kyujin-ch.jp/wp-admin` へのアクセスはログイン済みの場合のみ通過できる

---

## 7. 再発防止策

1. **事前テスト**：ログイン URL を変更する前に、Elementor 等の編集中プラグインとの相性（`interim-login` が機能するか）を検証する
2. **作業調整**：URL 変更等の影響範囲が広い設定変更は、全作業者が管理画面を閉じた状態で実施する
3. **変更連絡**：管理画面 URL を変更した際は、作業前に全関係者へ新 URL を事前共有する
4. **Autosave の確認**：Elementor の自動保存間隔設定を確認し、消失リスクを最小化する

---

## 8. 調査に使用したログ

- `/opt/bitnami/apache/logs/access_log-20260329.gz`（WP サーバー）
- WP データベース `wp_options`（whl_page 設定値の確認）
- WPS Hide Login プラグインソース（`classes/plugin.php`）

---

*以上*

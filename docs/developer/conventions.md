# コーディング規約

明文化されてなかったルールをここに集約。

## TypeScript

- 厳格モード (`strict: true`)
- `any` 使わない（やむを得ない場合は `unknown` 経由でナローイング）
- `as` キャストは最小限。`as unknown as X` 二段は型情報の合流地点でのみ
- 関数の引数・戻り値の型は明示的に書く
- enum は Prisma 経由（schema.prisma の enum を `@prisma/client` から import）

## Next.js (App Router)

- データ取得は **Server Component** で完結させる
- クライアントインタラクションが必要な部分のみ `"use client";` でクライアント化
- 重い処理は **Server Action** に逃がす（`"use server";`）
- `revalidatePath` で変更箇所のキャッシュを明示的に無効化
- `redirect()` を使うときは try/catch の外で（NEXT_REDIRECT エラーをキャッチしないよう）

## ファイル命名

- ページ: `page.tsx`
- レイアウト: `layout.tsx`
- ローディング: `loading.tsx`
- エラー: `error.tsx`
- 動的ルート: `[id]`, `[slug]`
- 並列ルート: `(group)`
- クライアントコンポーネント: `kebab-case.tsx`（例: `job-card.tsx`）
- Server Action: 動詞-名詞 (`submit-application.ts`)

## React

- 関数コンポーネントのみ（class 禁止）
- フックは無理に分割しない。1〜2画面で再利用しないなら同じファイル内で OK
- `useEffect` は最小化。サーバ側で計算できるものは Server Component で
- key は必ず安定した ID（`index` は最終手段）

## スタイリング (Tailwind 4)

- ユーティリティクラスを連結。CSS Modules・styled-components 不使用
- 長くなる場合は変数化（`const inputCls = "..."`）
- カラーは**直接 hex リテラル**（`bg-[#2f6cff]`）を使うことが多い。デザイントークン化は未整備
- `border-[#e8e8e8]`, `text-[#666]` などレポ全体で繰り返されるカラーは将来的に統一予定

## Prisma

- マイグレーション名は ISO日付風 `YYYYMMDDHHMMSS_<name>`（例: `20260618000000_report_block`）
- 既存テーブル変更は **追加のみ**を原則とする
- 削除・リネームは段階的に: 1) deprecated とコメント → 2) 全コード書き換え → 3) スキーマ削除

## エラーメッセージ

- ユーザー向けエラーは**日本語**
- console.error / console.log は本番でも残す（PM2 ログで確認用）
- 例外は throw new Error(message) で素朴に

## コミットメッセージ

- 日本語OK
- 1 行目に要約（70 文字以内）
- 空行を入れて本文
- 本文には「何を」「なぜ」を書く。「どのように」はコード参照

```
ストア審査要件: 通報・ブロック・退会 (Task 8/9/10)

ストア審査で必要な3機能を一括実装。
- 通報: /report ページ + /api/v1/reports
- ブロック: /mypage/blocks + 既存メッセージ判定に組込
- 退会: 既存フローに refresh token revocation 追加

Web もアプリも両方で効くように、両方の経路で
ブロック判定を実装。
```

## Server Actions の規約

- ファイル先頭に必ず `"use server";`
- 関数の最初に認証チェック
- データ変更後は `revalidatePath` を忘れない
- 戻り値で成否を表す `{ ok: true } | { ok: false, error: string }` 形式が頻出

## クライアント側でのバリデーション

- フォームは基本 native HTML validation + 簡単な手書きチェック
- 大規模スキーマ検証ライブラリ（zod, yup）は導入していない（将来検討）
- サーバー側でも必ず再検証する（クライアント検証は UX 向上目的のみ）

## 画像とアセット

- ユーザーアップロード: S3 (`/images/{type}/{userId}/{filename}`)
- 静的アセット: `public/` 配下
- アイコン: lucide-react は未導入。SVG を `components/` に直接配置することが多い

## テスト

- 自動テストは現状なし
- 手動シナリオテストは [docs/manual-scenario-test.md](../manual-scenario-test.md) に記載
- 大きな変更は本番デプロイ前にローカルで疎通確認

## コメント方針

- WHY を書く（背景・制約・トレードオフ）
- WHAT は書かない（コードを読めばわかる）
- 日本語OK。レポ全体で混在しても問題なし
- TODO は GitHub Issue に逃がす（コメントに残すと腐る）

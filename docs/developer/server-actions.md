# Server Actions 一覧

Web 側のロジックは Server Actions (`app/actions/**/*.ts`) に集約されている。
モバイル API（`/api/v1/*`）は別系統なので、ここでは扱わない（[rest-api.md](./rest-api.md) 参照）。

## ディレクトリ構成

```
app/actions/
├── user/        # 求職者向け
├── company/     # 企業向け
└── admin/       # 管理者向け
```

各ファイルは先頭に `"use server";` 必須。

## user/（求職者向け）

| ファイル | 主な関数 | 内容 |
|---|---|---|
| `user/profile.ts` | `updateProfile` / `uploadAvatar` | プロフィール編集 |
| `user/applications.ts` | `submitApplication` | 求人応募 |
| `user/favorites.ts` | `toggleFavorite` | お気に入り追加削除 |
| `user/resume.ts` | `updateResume` | 履歴書編集 |
| `user/messages.ts` | `sendMessage`, `markAsRead` | メッセージ送信 |
| `user/reports.ts` | `submitReport` | 通報 |
| `user/blocks.ts` | `blockUser`, `unblockUser`, `isBlockedBetween` | ブロック |
| `user/delete-account.ts` | `deleteAccount` | 退会（匿名化＋トークン失効） |

## company/（企業向け）

| ファイル | 主な関数 | 内容 |
|---|---|---|
| `company/jobs.ts` | `createJob`, `updateJob`, `duplicateJob`, `withdrawJobSubmission`, `toggleJobVisibility`, `deleteJob` | 求人 CRUD + 審査状態管理 |
| `company/applicants.ts` | `updateApplicationStatus`, `sendCompanyMessage`, `addNote` | 応募者管理 |
| `company/profile.ts` | `updateCompanyProfile` | 企業情報編集 |
| `company/accounts.ts` | `inviteUser`, `removeUser` | サブアカウント管理 |

## admin/（管理者向け）

| ファイル | 主な関数 | 内容 |
|---|---|---|
| `admin/jobs.ts` | `approveJob`, `returnJob` | 求人承認・差し戻し |
| `admin/companies.ts` | `updateCompany`, `impersonate` | 企業情報編集・代理ログイン |
| `admin/jobseekers.ts` | `deleteJobseeker`, `unblockJobseeker` | 求職者管理 |
| `admin/columns.ts` | `createColumn`, `updateColumn`, `deleteColumn` | コラム編集 |
| `admin/focus.ts` | `createFocusArticle`, `updateFocusArticle` | Focus 記事編集 |
| `admin/billing.ts` | `updateBillingRate` | 請求単価設定 |
| `admin/invoices.ts` | `generateInvoice`, `markPaid` | 請求書生成・入金処理 |
| `admin/inquiries.ts` | `updateInquiryStatus` | 問い合わせ対応 |

## 認証パターン

Server Action 内では必ず最初に認証ヘルパーを呼ぶ。

```typescript
"use server";

import { requireCompany } from "@/lib/auth-helpers";

async function getCompany() {
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { users: { some: { id: session.user.id } } },
    select: { id: true, name: true },
  });
  if (!company) throw new Error("Company not found");
  return { ...company, userId: session.user.id };
}

export async function someAction(input: Input) {
  const company = await getCompany();
  // ... ロジック
}
```

## revalidatePath パターン

データ変更後は影響範囲のパスを `revalidatePath` で無効化。

```typescript
import { revalidatePath } from "next/cache";

await prisma.job.update({ ... });
revalidatePath("/company/jobs");
revalidatePath("/admin/jobs");
revalidatePath(`/jobs/${jobId}`);
revalidatePath("/");
```

## エラーハンドリング

戻り値で成否を表す `{ ok: true } | { ok: false, error: string }` 形式が頻出。

```typescript
try {
  // ロジック
  return { ok: true };
} catch (err) {
  const message = err instanceof Error ? err.message : "不明なエラー";
  console.error("[someAction]", err);
  return { ok: false, error: message };
}
```

呼び出し側:
```tsx
const res = await someAction(input);
if (!res.ok) setError(res.error);
```

## 通知統合

### Slack 通知

`lib/slack.ts` のヘルパーを呼ぶ:
- `postJobReviewSlack` — 求人審査依頼
- `postCompanyRequestSlack` — 企業要望

### メール通知

`lib/email.ts` の SES v2 ラッパーを呼ぶ:
- `sendApplicationNotification` — 応募通知
- `sendMessageNotification` — メッセージ通知
- `sendInviteEmail` — サブアカウント招待

## ファイルアップロード

S3 へのアップロードは Server Action 内で完結（pre-signed URL ではなく直接アップロード）。

```typescript
import { uploadToS3 } from "@/lib/s3";

const url = await uploadToS3({
  key: `images/avatars/${userId}/${filename}`,
  body: buffer,
  contentType: file.type,
});
```

S3 バケットポリシーで `/images/*` プレフィックスのみ公開読み込み可。

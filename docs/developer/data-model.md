# データモデル

`prisma/schema.prisma` の全体像と主要な関連を解説。
詳細なフィールドは `prisma/schema.prisma` を参照。

## 主要テーブル

### User（ユーザー）

全ロールの基底。`role` で区別。

| role | 説明 |
|---|---|
| `USER` | 求職者 |
| `COMPANY` | 企業ユーザー |
| `ADMIN` | 運営管理者（権限を `adminPermissions` JSON で細分化） |
| `SUPER_ADMIN` | フル権限の管理者 |
| `SEO_EDITOR` | コラム編集だけ可能な制限ロール |

関連:
- 1:N → `Application` (応募)
- 1:N → `Favorite` (お気に入り)
- 1:N → `Conversation` (会話)
- 1:N → `Message` (送受信メッセージ)
- 1:N → `RefreshToken` (モバイル用)
- 1:N → `PushDevice` (モバイル用)
- 1:N → `Report` (通報)
- 1:N → `Block` (ブロック)
- N:1 → `Company` (COMPANY ロールのみ)

### Company（企業）

| 主なフィールド | 説明 |
|---|---|
| `name` | 企業名 |
| `industry` | 業種 |
| `employeeCount` | 従業員数 |
| `adminPassword` | 運営が代理ログインする際のパスワード |
| `slug` | 公開URL `/companies/{slug}` のスラッグ |

関連:
- 1:N → `Job`
- N:M → `User` (1社N人サブアカウント)

### Job（求人）

求人投稿の中核。フィールドが多い。

#### 主要フィールド

| カテゴリ | フィールド |
|---|---|
| 基本 | `title`, `description`, `employmentType`, `categoryTag` |
| 給与 | `salaryType`, `salaryMin`, `salaryMax`, `monthlySalary`, `annualSalary`, `fixedOvertime` |
| 場所 | `location`, `region`, `officeName`, `officeDetail`, `postalCode`, `companyLocation`, `isDirectDispatch`, `handlingArea` |
| 勤務時間 | `workingHoursType`, `workingHoursDetail` (JSON) |
| 休日休暇 | `holidayType`, `annualHolidayCount`, `holidayFeatures`, `holidayPolicy`, `holidayNote` |
| 試用期間 | `trialPeriodExists`, `trialPeriodMonths`, `trialEmploymentSame` 他 |
| 選考 | `selectionProcess`, `interviewCount`, `selectionDuration` |
| 福利厚生 | `benefits[]`, `benefitNote` |
| ターゲット | `targetType` (MID_CAREER / NEW_GRAD / PART_TIME_INTERN), `graduationYear` |
| 募集背景 | `recruitmentBackground`, `positionMission`, `recommendedFor`, `desiredAptitude` |
| 受動喫煙対策 | `smokingPolicyIndoor`, `smokingPolicyOutdoor`, `smokingNote` |

#### 審査関連

| フィールド | 説明 |
|---|---|
| `reviewStatus` | DRAFT / PENDING_REVIEW / PUBLISHED / RETURNED / WITHDRAWN |
| `isPublished` | 公開フラグ |
| `pendingContent` | 公開版がある求人の差し替え審査中の新しい内容（JSON） |
| `reviewComment` | 差し戻し理由（JSON） |
| `reviewStatusChangedAt` | ステータス最終変更日時 |

#### 関連

- N:1 → `Company`
- 1:N → `Application` (応募)
- 1:N → `Favorite` (お気に入り)
- 1:N → `JobView` (PV)
- 1:N → `JobReviewLog` (審査ログ)

### Application（応募）

| 主なフィールド | 説明 |
|---|---|
| `userId` | 応募者 |
| `jobId` | 応募求人 |
| `status` | PENDING / VIEWED / PASSED / REJECTED |
| `selfPR`, `expectedSalary` 等 | 応募時情報 |

関連:
- 1:N → `ApplicationNote` (担当者メモ)
- 1:1 → `Conversation` (応募と紐づく会話)

### Conversation（会話）+ Message（メッセージ）

応募1件 = 会話1スレッド。

```
Conversation {
  id, applicationId, jobseekerId, companyId
  unreadByJobseeker, unreadByCompany  // 個別カウンタ
  lastMessageAt
}

Message {
  conversationId, senderId
  body
  isSystemMessage  // システムメッセージ（応募完了通知等）
  readAt
}
```

### Block / Report（ブロック・通報）

ストア審査要件。

```
Block { blockerId, blockedId, @@unique }
Report { reporterId, targetType, targetId, reason, detail, status }
```

### Column / BizColumn / FocusArticle（コラム系）

| モデル | 用途 | ターゲット |
|---|---|---|
| `Column` | 求職者向けコラム | 求職者 |
| `BizColumn` | 企業向けコラム（WP連携） | 企業 |
| `FocusArticle` | Focus 特集記事 | 求職者 |

### JobReviewLog（審査ログ）

求人ステータスの遷移を全て記録。

```
JobReviewLog {
  jobId, status, comment, changedById, changedAt
}
```

- 企業の新規作成・更新・取り下げ
- 管理者の承認（PUBLISHED）・差し戻し（RETURNED）

### Invoice / InvoiceItem（請求）

応募 1 件に対して企業から取れる単価を `BillingRate` で持ち、月次で `Invoice` に集計。

### Inquiry（問い合わせ）

公開フォームから来る問い合わせ。`category` で分類。

## モバイル用テーブル

### RefreshToken

| フィールド | 説明 |
|---|---|
| `userId` | 関連ユーザー |
| `tokenHash` | SHA-256 ハッシュ（生トークンは保存しない） |
| `device`, `userAgent`, `ipAddress` | 監査用 |
| `expiresAt`, `revokedAt` | 期限管理 |

ローテーション方式: refresh するたびに古い token を `revokedAt` で無効化 → 新しい token を発行。

### PushDevice

| フィールド | 説明 |
|---|---|
| `userId` | 関連ユーザー |
| `token` | FCM/APNs トークン |
| `platform` | `ios` / `android` |
| `deviceId` | 端末識別子（重複登録防止） |

## 主要な ENUM

```prisma
enum Role {
  USER COMPANY ADMIN SUPER_ADMIN SEO_EDITOR
}

enum JobReviewStatus {
  DRAFT PENDING_REVIEW PUBLISHED RETURNED WITHDRAWN
}

enum ApplicationStatus {
  PENDING VIEWED PASSED REJECTED
}

enum EmploymentType {
  REGULAR CONTRACT TEMPORARY OUTSOURCING PART_TIME OTHER
}

enum TargetType {
  MID_CAREER NEW_GRAD PART_TIME_INTERN
}

enum InquiryCategory {
  JOB_SEEKER COMPANY OTHER
}

enum InquiryStatus {
  OPEN IN_PROGRESS CLOSED
}
```

## マイグレーション運用

```bash
# 開発（手元のDBを更新）
npx prisma migrate dev --name <変更内容>

# 本番（既存マイグレーションを適用するだけ）
npx prisma migrate deploy
```

新しいマイグレーションファイルは `prisma/migrations/<timestamp>_<name>/migration.sql` に手で配置可（命名規則: ISO日付風 `YYYYMMDDHHMMSS_*`）。

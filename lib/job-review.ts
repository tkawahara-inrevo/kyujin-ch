import type { JobReviewStatus } from "@prisma/client";

export const JOB_REVIEW_STATUS_LABELS: Record<JobReviewStatus, string> = {
  DRAFT: "下書き",
  PENDING_REVIEW: "審査中",
  PUBLISHED: "公開",
  RETURNED: "差し戻し",
};

export const JOB_REVIEW_STATUS_BADGE_CLASSES: Record<JobReviewStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  PENDING_REVIEW: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  RETURNED: "bg-rose-100 text-rose-700",
};

export function isJobPublished(status: JobReviewStatus) {
  return status === "PUBLISHED";
}

const REVIEW_SECTION_LABELS: Record<string, string> = {
  "section-title": "タイトル・メイン画像",
  "section-description": "概要",
  "section-employment": "募集要項",
  "section-salary": "雇用情報",
  "section-trial": "試用期間",
  "section-holiday": "休日休暇",
  "section-benefits": "福利厚生",
  "section-selection": "選考情報",
  "section-smoking": "受動喫煙対策",
  other: "その他",
  title: "タイトル", image: "メイン画像", category: "求人カテゴリ",
  employmentType: "雇用形態", description: "仕事内容", requirements: "応募条件",
  salary: "給与", fixedOvertime: "みなし残業", workingHours: "勤務時間",
  trialPeriod: "試用期間", holiday: "休日・休暇", benefits: "福利厚生",
  location: "勤務地", selectionProcess: "選考フロー", smoking: "受動喫煙対策",
};

export function formatReviewComment(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    const entries = Object.entries(parsed).filter(([, v]) => v.trim());
    if (entries.length === 0) return raw;
    return entries.map(([k, v]) => `【${REVIEW_SECTION_LABELS[k] ?? k}】${v}`).join("　/　");
  } catch {
    return raw;
  }
}

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

-- Job: みなし残業なし時の時間外労働取扱い
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "overtimeTreatment" TEXT;

-- 審査ログ
CREATE TABLE IF NOT EXISTS "JobReviewLog" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "status" "JobReviewStatus" NOT NULL,
  "comment" TEXT,
  "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "changedById" TEXT,

  CONSTRAINT "JobReviewLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "JobReviewLog_jobId_changedAt_idx" ON "JobReviewLog"("jobId", "changedAt");

ALTER TABLE "JobReviewLog" ADD CONSTRAINT "JobReviewLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

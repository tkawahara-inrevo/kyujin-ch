-- CreateEnum
CREATE TYPE "JobReviewStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'RETURNED');

-- AlterTable
ALTER TABLE "Job"
ADD COLUMN     "reviewComment" TEXT,
ADD COLUMN     "reviewStatus" "JobReviewStatus" NOT NULL DEFAULT 'DRAFT';

-- Backfill current jobs based on existing publish flag
UPDATE "Job"
SET "reviewStatus" = CASE
  WHEN "isPublished" = true THEN 'PUBLISHED'::"JobReviewStatus"
  ELSE 'DRAFT'::"JobReviewStatus"
END;

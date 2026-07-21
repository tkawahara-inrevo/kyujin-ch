-- Add tags column to Company
ALTER TABLE "Company" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
CREATE INDEX "Company_tags_idx" ON "Company" USING GIN ("tags");

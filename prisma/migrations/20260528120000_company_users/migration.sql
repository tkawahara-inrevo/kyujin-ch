-- User.companyId カラム追加（複数CompanyUser → 1 Company）
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyId" TEXT;

-- 既存primary owner をバックフィル: Company.companyUserId が指している User の companyId = Company.id
UPDATE "User" u
SET "companyId" = c.id
FROM "Company" c
WHERE c."companyUserId" = u.id
  AND u."companyId" IS NULL;

-- FK
ALTER TABLE "User"
  ADD CONSTRAINT "User_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id")
  ON UPDATE CASCADE ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "User_companyId_idx" ON "User"("companyId");

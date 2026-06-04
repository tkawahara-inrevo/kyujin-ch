-- PriceEntry に targetType を追加（既存は MID_CAREER 扱い）
ALTER TABLE "PriceEntry" ADD COLUMN IF NOT EXISTS "targetType" TEXT NOT NULL DEFAULT 'MID_CAREER';

CREATE INDEX IF NOT EXISTS "PriceEntry_targetType_idx" ON "PriceEntry"("targetType");

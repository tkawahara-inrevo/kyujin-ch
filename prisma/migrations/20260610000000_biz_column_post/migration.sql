-- toB向けコラム
CREATE TABLE "BizColumnPost" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "body" TEXT NOT NULL,
  "thumbnailUrl" TEXT,
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMP(3),
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "authorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BizColumnPost_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BizColumnPost_slug_key" ON "BizColumnPost"("slug");
CREATE INDEX "BizColumnPost_isPublished_publishedAt_createdAt_idx" ON "BizColumnPost"("isPublished", "publishedAt", "createdAt");
CREATE INDEX "BizColumnPost_slug_idx" ON "BizColumnPost"("slug");

ALTER TABLE "BizColumnPost"
  ADD CONSTRAINT "BizColumnPost_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

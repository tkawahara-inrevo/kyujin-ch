CREATE TABLE "ColumnPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ColumnPost_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ColumnPost_isPublished_publishedAt_createdAt_idx"
ON "ColumnPost"("isPublished", "publishedAt", "createdAt");

ALTER TABLE "ColumnPost"
ADD CONSTRAINT "ColumnPost_authorId_fkey"
FOREIGN KEY ("authorId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "FocusArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isHot" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "authorName" TEXT,
    "authorBio" TEXT,
    "authorImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FocusArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FocusArticle_slug_key" ON "FocusArticle"("slug");

-- CreateIndex
CREATE INDEX "FocusArticle_isPublished_publishedAt_idx" ON "FocusArticle"("isPublished", "publishedAt");

-- CreateIndex
CREATE INDEX "FocusArticle_slug_idx" ON "FocusArticle"("slug");

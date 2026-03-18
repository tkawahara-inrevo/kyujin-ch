CREATE TYPE "InquiryCategory" AS ENUM ('QUESTION', 'BUG_REPORT');
CREATE TYPE "InquiryStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');

CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "category" "InquiryCategory" NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'OPEN',
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Inquiry_status_createdAt_idx" ON "Inquiry"("status", "createdAt");
CREATE INDEX "Inquiry_category_createdAt_idx" ON "Inquiry"("category", "createdAt");

ALTER TABLE "Inquiry"
ADD CONSTRAINT "Inquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

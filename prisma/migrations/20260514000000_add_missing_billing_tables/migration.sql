-- CreateEnum (if not exists)
DO $$ BEGIN
    CREATE TYPE "InvalidRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable: PriceEntry
CREATE TABLE IF NOT EXISTS "PriceEntry" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "experiencedPrice" INTEGER NOT NULL,
    "inexperiencedPrice" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "categorySortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Charge
CREATE TABLE IF NOT EXISTS "Charge" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "billingMonth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Charge_pkey" PRIMARY KEY ("id")
);

-- CreateTable: InvalidRequest
CREATE TABLE IF NOT EXISTS "InvalidRequest" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "InvalidRequestStatus" NOT NULL DEFAULT 'PENDING',
    "deadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvalidRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MonthlyBilling
CREATE TABLE IF NOT EXISTS "MonthlyBilling" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "billingMonth" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "isFinalized" BOOLEAN NOT NULL DEFAULT false,
    "finalizedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyBilling_pkey" PRIMARY KEY ("id")
);

-- CreateTable: JobView
CREATE TABLE IF NOT EXISTS "JobView" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,

    CONSTRAINT "JobView_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MessageTemplate
CREATE TABLE IF NOT EXISTS "MessageTemplate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PriceEntry_categorySortOrder_sortOrder_idx" ON "PriceEntry"("categorySortOrder", "sortOrder");

-- CreateIndex (unique)
DO $$ BEGIN
    ALTER TABLE "Charge" ADD CONSTRAINT "Charge_applicationId_key" UNIQUE ("applicationId");
EXCEPTION
    WHEN duplicate_table THEN null;
    WHEN others THEN null;
END $$;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "MonthlyBilling_companyId_billingMonth_key" ON "MonthlyBilling"("companyId", "billingMonth");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "JobView_jobId_viewedAt_idx" ON "JobView"("jobId", "viewedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MessageTemplate_companyId_sortOrder_idx" ON "MessageTemplate"("companyId", "sortOrder");

-- AddForeignKey (Charge → Application)
DO $$ BEGIN
    ALTER TABLE "Charge" ADD CONSTRAINT "Charge_applicationId_fkey"
        FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey (InvalidRequest → Application)
DO $$ BEGIN
    ALTER TABLE "InvalidRequest" ADD CONSTRAINT "InvalidRequest_applicationId_fkey"
        FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey (InvalidRequest → Company)
DO $$ BEGIN
    ALTER TABLE "InvalidRequest" ADD CONSTRAINT "InvalidRequest_companyId_fkey"
        FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey (MonthlyBilling → Company)
DO $$ BEGIN
    ALTER TABLE "MonthlyBilling" ADD CONSTRAINT "MonthlyBilling_companyId_fkey"
        FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey (JobView → Job)
DO $$ BEGIN
    ALTER TABLE "JobView" ADD CONSTRAINT "JobView_jobId_fkey"
        FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

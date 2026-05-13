-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "schoolType" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "faculty" TEXT,
    "status" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkExperience" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "department" TEXT,
    "jobType" TEXT,
    "startYear" INTEGER NOT NULL,
    "startMonth" INTEGER NOT NULL,
    "endYear" INTEGER,
    "endMonth" INTEGER,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT UNIQUE NOT NULL,
    "prText" TEXT,
    "jobPreference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Education_userId_sortOrder_idx" ON "Education"("userId", "sortOrder");

-- CreateIndex
CREATE INDEX "WorkExperience_userId_sortOrder_idx" ON "WorkExperience"("userId", "sortOrder");

-- CreateIndex
CREATE INDEX "Certification_userId_sortOrder_idx" ON "Certification"("userId", "sortOrder");

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkExperience" ADD CONSTRAINT "WorkExperience_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeProfile" ADD CONSTRAINT "ResumeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

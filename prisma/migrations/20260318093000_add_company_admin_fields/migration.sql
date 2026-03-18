ALTER TABLE "User"
ADD COLUMN "username" TEXT,
ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT;

ALTER TABLE "Company"
ADD COLUMN "corporateNumber" TEXT;

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "Company_corporateNumber_key" ON "Company"("corporateNumber");

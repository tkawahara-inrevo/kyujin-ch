-- Add SUPER_ADMIN to UserRole enum
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- Add adminPermissions column
ALTER TABLE "User" ADD COLUMN "adminPermissions" JSONB;

-- Upgrade existing admin@kyujin-ch.com to SUPER_ADMIN
UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'admin@kyujin-ch.com';

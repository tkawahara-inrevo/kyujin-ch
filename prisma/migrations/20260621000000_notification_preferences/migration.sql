-- 通知細分化フラグ追加
ALTER TABLE "User" ADD COLUMN "notifyMessages"     BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "notifyApplications" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "notifyMarketing"    BOOLEAN NOT NULL DEFAULT false;

-- 既存ユーザーで notificationsEnabled=false のひとは新フラグも false に揃える
UPDATE "User" SET "notifyMessages" = false, "notifyApplications" = false WHERE "notificationsEnabled" = false;

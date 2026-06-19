-- PushDevice.deviceId を NOT NULL UNIQUE に変更
-- 既存レコードで deviceId が NULL のものは仮値を入れる
UPDATE "PushDevice" SET "deviceId" = CONCAT('legacy-', "id") WHERE "deviceId" IS NULL;

ALTER TABLE "PushDevice" ALTER COLUMN "deviceId" SET NOT NULL;
CREATE UNIQUE INDEX "PushDevice_deviceId_key" ON "PushDevice"("deviceId");

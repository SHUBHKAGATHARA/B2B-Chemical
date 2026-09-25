-- Migration: add_device_id_to_device_tokens
-- Purpose: Introduce a stable deviceId field so FCM token changes
--          update ONE row per device instead of creating duplicates.
--          Existing rows get a synthetic deviceId derived from their
--          current FCM token so no data is lost.

-- Step 1: Remove the old unique constraint on token
ALTER TABLE "device_tokens" DROP CONSTRAINT IF EXISTS "device_tokens_token_key";

-- Step 2: Add new columns with defaults for existing rows
ALTER TABLE "device_tokens"
    ADD COLUMN IF NOT EXISTS "deviceId"   TEXT,
    ADD COLUMN IF NOT EXISTS "deviceName" TEXT,
    ADD COLUMN IF NOT EXISTS "appVersion" TEXT,
    ADD COLUMN IF NOT EXISTS "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 3: Back-fill deviceId for existing rows using their FCM token as the
--         synthetic stable identifier (safe because old tokens are unique).
UPDATE "device_tokens"
SET "deviceId" = 'legacy-' || SUBSTRING("token", 1, 40)
WHERE "deviceId" IS NULL;

-- Step 4: Now make deviceId NOT NULL (all rows filled)
ALTER TABLE "device_tokens" ALTER COLUMN "deviceId" SET NOT NULL;

-- Step 5: Add the new unique constraint on (userId, deviceId)
ALTER TABLE "device_tokens"
    ADD CONSTRAINT "device_tokens_userId_deviceId_key"
    UNIQUE ("userId", "deviceId");

-- Step 6: Add performance indexes
CREATE INDEX IF NOT EXISTS "device_tokens_token_idx"            ON "device_tokens"("token");
CREATE INDEX IF NOT EXISTS "device_tokens_userId_idx"           ON "device_tokens"("userId");
CREATE INDEX IF NOT EXISTS "device_tokens_userId_isActive_idx"  ON "device_tokens"("userId", "isActive");

-- extend_notifications_multi_type
-- Extends the Notification model to support PDF, NEWS, and SYSTEM types.
-- Existing PDF notifications are preserved with type=PDF defaults.

-- Step 1: Create the NotificationType enum
CREATE TYPE "NotificationType" AS ENUM ('PDF', 'NEWS', 'SYSTEM');

-- Step 2: Add new columns to notifications table
-- Add type with default PDF (preserves all existing records)
ALTER TABLE "notifications" ADD COLUMN "type" "NotificationType" NOT NULL DEFAULT 'PDF';

-- Add title with default (preserves all existing records)
ALTER TABLE "notifications" ADD COLUMN "title" TEXT NOT NULL DEFAULT 'New Document Received';

-- Add message with default (preserves all existing records)
ALTER TABLE "notifications" ADD COLUMN "message" TEXT NOT NULL DEFAULT 'A new document has been shared with you';

-- Add newsId as nullable (new NEWS notifications only)
ALTER TABLE "notifications" ADD COLUMN "newsId" TEXT;

-- Step 3: Make pdfId nullable (was required before; NEWS notifications won't have it)
ALTER TABLE "notifications" ALTER COLUMN "pdfId" DROP NOT NULL;

-- Step 4: Drop old foreign key constraint on pdfId (was CASCADE, need SetNull now)
ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "notifications_pdfId_fkey";

-- Re-add pdfId foreign key with SetNull behaviour
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_pdfId_fkey"
    FOREIGN KEY ("pdfId") REFERENCES "pdf_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 5: Add foreign key for newsId
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_newsId_fkey"
    FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 6: Add new indexes
CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "notifications"("type");
CREATE INDEX IF NOT EXISTS "notifications_newsId_idx" ON "notifications"("newsId");
CREATE INDEX IF NOT EXISTS "notifications_distId_type_idx" ON "notifications"("distId", "type");

-- Step 7: Handle users table columns that exist in DB but not in schema
-- These columns were added in a previous migration but removed from schema.prisma.
-- We drop them to sync the schema. Data loss warning accepted.
ALTER TABLE "users" DROP COLUMN IF EXISTS "accountName";
ALTER TABLE "users" DROP COLUMN IF EXISTS "address";
ALTER TABLE "users" DROP COLUMN IF EXISTS "phoneNumber";
ALTER TABLE "users" DROP COLUMN IF EXISTS "updatedAt";
ALTER TABLE "users" DROP COLUMN IF EXISTS "location";
ALTER TABLE "users" DROP COLUMN IF EXISTS "website";

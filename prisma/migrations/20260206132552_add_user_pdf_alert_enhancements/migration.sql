/*
  Warnings:

  - You are about to drop the column `deviceToken` on the `push_notification_logs` table. All the data in the column will be lost.
  - You are about to drop the column `errorMessage` on the `push_notification_logs` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `companies` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `userId` on table `push_notification_logs` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');

-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_createdById_fkey";

-- DropIndex
DROP INDEX "push_notification_logs_deviceToken_idx";

-- DropIndex
DROP INDEX "users_companyId_idx";

-- AlterTable
ALTER TABLE "distributors" ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "pdf_uploads" ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "push_notification_logs" DROP COLUMN "deviceToken",
DROP COLUMN "errorMessage",
ADD COLUMN     "error" TEXT,
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "companyId",
ADD COLUMN     "accountName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "address" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "location" TEXT,
ADD COLUMN     "phoneNumber" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "profilePicture" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "website" TEXT;

-- DropTable
DROP TABLE "companies";

-- CreateTable
CREATE TABLE "company_settings" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "distributorName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "taxRegistrationId" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdf_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pdf_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "imageUrl" TEXT,
    "buttonText" TEXT,
    "buttonAction" TEXT,
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pdf_categories_name_key" ON "pdf_categories"("name");

-- CreateIndex
CREATE INDEX "pdf_categories_name_idx" ON "pdf_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "alerts_alertId_key" ON "alerts"("alertId");

-- CreateIndex
CREATE INDEX "alerts_status_idx" ON "alerts"("status");

-- CreateIndex
CREATE INDEX "alerts_startDate_idx" ON "alerts"("startDate");

-- CreateIndex
CREATE INDEX "alerts_endDate_idx" ON "alerts"("endDate");

-- CreateIndex
CREATE INDEX "alerts_status_startDate_endDate_idx" ON "alerts"("status", "startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "pdf_uploads_categoryId_idx" ON "pdf_uploads"("categoryId");

-- AddForeignKey
ALTER TABLE "pdf_uploads" ADD CONSTRAINT "pdf_uploads_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "pdf_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

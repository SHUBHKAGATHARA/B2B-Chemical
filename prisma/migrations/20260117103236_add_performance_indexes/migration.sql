-- CreateIndex
CREATE INDEX "distributors_email_idx" ON "distributors"("email");

-- CreateIndex
CREATE INDEX "distributors_status_idx" ON "distributors"("status");

-- CreateIndex
CREATE INDEX "distributors_createdAt_idx" ON "distributors"("createdAt");

-- CreateIndex
CREATE INDEX "logs_userId_idx" ON "logs"("userId");

-- CreateIndex
CREATE INDEX "logs_createdAt_idx" ON "logs"("createdAt");

-- CreateIndex
CREATE INDEX "logs_userId_createdAt_idx" ON "logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "news_authorId_idx" ON "news"("authorId");

-- CreateIndex
CREATE INDEX "news_category_idx" ON "news"("category");

-- CreateIndex
CREATE INDEX "news_publishDate_idx" ON "news"("publishDate");

-- CreateIndex
CREATE INDEX "news_createdAt_idx" ON "news"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_pdfId_idx" ON "notifications"("pdfId");

-- CreateIndex
CREATE INDEX "notifications_distId_idx" ON "notifications"("distId");

-- CreateIndex
CREATE INDEX "notifications_readFlag_idx" ON "notifications"("readFlag");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_distId_readFlag_idx" ON "notifications"("distId", "readFlag");

-- CreateIndex
CREATE INDEX "notifications_distId_createdAt_idx" ON "notifications"("distId", "createdAt");

-- CreateIndex
CREATE INDEX "pdf_uploads_uploadedByAdminId_idx" ON "pdf_uploads"("uploadedByAdminId");

-- CreateIndex
CREATE INDEX "pdf_uploads_assignedDistributorId_idx" ON "pdf_uploads"("assignedDistributorId");

-- CreateIndex
CREATE INDEX "pdf_uploads_status_idx" ON "pdf_uploads"("status");

-- CreateIndex
CREATE INDEX "pdf_uploads_assignedGroup_idx" ON "pdf_uploads"("assignedGroup");

-- CreateIndex
CREATE INDEX "pdf_uploads_createdAt_idx" ON "pdf_uploads"("createdAt");

-- CreateIndex
CREATE INDEX "pdf_uploads_assignedDistributorId_assignedGroup_idx" ON "pdf_uploads"("assignedDistributorId", "assignedGroup");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "users_lastLogin_idx" ON "users"("lastLogin");

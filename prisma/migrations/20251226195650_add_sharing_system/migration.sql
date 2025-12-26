-- CreateTable
CREATE TABLE "ShareRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "recipientId" TEXT,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "itemCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "ShareRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shareRequestId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShareRequest_senderId_idx" ON "ShareRequest"("senderId");

-- CreateIndex
CREATE INDEX "ShareRequest_recipientId_idx" ON "ShareRequest"("recipientId");

-- CreateIndex
CREATE INDEX "ShareRequest_recipientEmail_idx" ON "ShareRequest"("recipientEmail");

-- CreateIndex
CREATE INDEX "ShareRequest_status_idx" ON "ShareRequest"("status");

-- CreateIndex
CREATE INDEX "ShareRequest_recipientId_status_idx" ON "ShareRequest"("recipientId", "status");

-- CreateIndex
CREATE INDEX "ShareRequest_senderId_status_idx" ON "ShareRequest"("senderId", "status");

-- CreateIndex
CREATE INDEX "ShareNotification_userId_read_idx" ON "ShareNotification"("userId", "read");

-- CreateIndex
CREATE INDEX "ShareNotification_userId_dismissed_idx" ON "ShareNotification"("userId", "dismissed");

-- CreateIndex
CREATE INDEX "ShareNotification_userId_createdAt_idx" ON "ShareNotification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ShareNotification_shareRequestId_idx" ON "ShareNotification"("shareRequestId");

-- AddForeignKey
ALTER TABLE "ShareRequest" ADD CONSTRAINT "ShareRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareRequest" ADD CONSTRAINT "ShareRequest_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareNotification" ADD CONSTRAINT "ShareNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

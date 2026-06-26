-- AlterTable
ALTER TABLE "Task" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE "Task" ADD COLUMN "priority" TEXT;
ALTER TABLE "Task" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Task_userId_idx" ON "Task"("userId");
CREATE INDEX "Task_deadline_idx" ON "Task"("deadline");
CREATE INDEX "Task_status_idx" ON "Task"("status");
CREATE INDEX "Task_deletedAt_idx" ON "Task"("deletedAt");
CREATE INDEX "Task_userId_status_idx" ON "Task"("userId", "status");

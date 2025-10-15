-- CreateEnum
CREATE TYPE "DeactivationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "therapist_deactivation_requests" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "status" "DeactivationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "therapist_deactivation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "therapist_deactivation_requests_therapistId_idx" ON "therapist_deactivation_requests"("therapistId");

-- CreateIndex
CREATE INDEX "therapist_deactivation_requests_status_idx" ON "therapist_deactivation_requests"("status");

-- CreateIndex
CREATE INDEX "therapist_deactivation_requests_requestedAt_idx" ON "therapist_deactivation_requests"("requestedAt");

-- AddForeignKey
ALTER TABLE "therapist_deactivation_requests" ADD CONSTRAINT "therapist_deactivation_requests_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "therapists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

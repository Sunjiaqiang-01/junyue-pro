-- AlterTable
ALTER TABLE "therapist_photos" ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "therapist_photos_therapistId_isPrimary_idx" ON "therapist_photos"("therapistId", "isPrimary");

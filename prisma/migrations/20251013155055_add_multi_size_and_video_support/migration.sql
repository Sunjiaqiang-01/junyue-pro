-- AlterTable
ALTER TABLE "therapist_photos" ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "isVideo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "largeUrl" TEXT,
ADD COLUMN     "mediumUrl" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT,
ADD COLUMN     "videoUrl" TEXT;

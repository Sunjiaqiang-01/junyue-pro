-- CreateEnum
CREATE TYPE "TherapistStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'BANNED');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('VISIT_CLIENT', 'CLIENT_VISIT', 'NEGOTIATE');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'OPERATOR');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'AUDIT', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('NOTICE', 'ACTIVITY', 'MAINTENANCE');

-- CreateTable
CREATE TABLE "therapists" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "areas" TEXT[],
    "status" "TherapistStatus" NOT NULL DEFAULT 'PENDING',
    "auditReason" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastOnlineAt" TIMESTAMP(3),
    "isNew" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "inviteCode" TEXT NOT NULL,
    "invitedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "auditedAt" TIMESTAMP(3),

    CONSTRAINT "therapists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "therapist_profiles" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "introduction" TEXT NOT NULL,
    "specialties" TEXT[],
    "wechat" TEXT,
    "qq" TEXT,
    "phone" TEXT,
    "serviceType" "ServiceType"[],
    "serviceAddress" TEXT,
    "serviceLat" DECIMAL(10,7),
    "serviceLng" DECIMAL(10,7),
    "serviceRadius" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "therapist_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "therapist_photos" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "therapist_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "therapist_videos" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "coverUrl" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "therapist_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "therapist_schedules" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "therapist_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "AnnouncementType" NOT NULL DEFAULT 'NOTICE',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_services" (
    "id" TEXT NOT NULL,
    "wechatQrCode" TEXT NOT NULL,
    "wechatId" TEXT,
    "phone" TEXT,
    "workingHours" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "therapists_phone_key" ON "therapists"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "therapists_inviteCode_key" ON "therapists"("inviteCode");

-- CreateIndex
CREATE INDEX "therapists_phone_idx" ON "therapists"("phone");

-- CreateIndex
CREATE INDEX "therapists_status_idx" ON "therapists"("status");

-- CreateIndex
CREATE INDEX "therapists_city_idx" ON "therapists"("city");

-- CreateIndex
CREATE INDEX "therapists_isOnline_idx" ON "therapists"("isOnline");

-- CreateIndex
CREATE INDEX "therapists_createdAt_idx" ON "therapists"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "therapist_profiles_therapistId_key" ON "therapist_profiles"("therapistId");

-- CreateIndex
CREATE INDEX "therapist_profiles_therapistId_idx" ON "therapist_profiles"("therapistId");

-- CreateIndex
CREATE INDEX "therapist_photos_therapistId_idx" ON "therapist_photos"("therapistId");

-- CreateIndex
CREATE INDEX "therapist_photos_order_idx" ON "therapist_photos"("order");

-- CreateIndex
CREATE INDEX "therapist_videos_therapistId_idx" ON "therapist_videos"("therapistId");

-- CreateIndex
CREATE INDEX "therapist_schedules_therapistId_idx" ON "therapist_schedules"("therapistId");

-- CreateIndex
CREATE INDEX "therapist_schedules_date_idx" ON "therapist_schedules"("date");

-- CreateIndex
CREATE UNIQUE INDEX "therapist_schedules_therapistId_date_startTime_key" ON "therapist_schedules"("therapistId", "date", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_key" ON "cities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cities_code_key" ON "cities"("code");

-- CreateIndex
CREATE INDEX "cities_isActive_idx" ON "cities"("isActive");

-- CreateIndex
CREATE INDEX "cities_order_idx" ON "cities"("order");

-- CreateIndex
CREATE INDEX "areas_cityId_idx" ON "areas"("cityId");

-- CreateIndex
CREATE INDEX "areas_isActive_idx" ON "areas"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "areas_cityId_name_key" ON "areas"("cityId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE INDEX "admins_username_idx" ON "admins"("username");

-- CreateIndex
CREATE INDEX "notifications_therapistId_idx" ON "notifications"("therapistId");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "announcements_type_idx" ON "announcements"("type");

-- CreateIndex
CREATE INDEX "announcements_isPublished_idx" ON "announcements"("isPublished");

-- CreateIndex
CREATE INDEX "announcements_publishedAt_idx" ON "announcements"("publishedAt");

-- CreateIndex
CREATE INDEX "customer_services_isActive_idx" ON "customer_services"("isActive");

-- AddForeignKey
ALTER TABLE "therapists" ADD CONSTRAINT "therapists_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "therapists"("inviteCode") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapist_profiles" ADD CONSTRAINT "therapist_profiles_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "therapists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapist_photos" ADD CONSTRAINT "therapist_photos_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "therapists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapist_videos" ADD CONSTRAINT "therapist_videos_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "therapists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapist_schedules" ADD CONSTRAINT "therapist_schedules_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "therapists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "areas" ADD CONSTRAINT "areas_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "therapists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

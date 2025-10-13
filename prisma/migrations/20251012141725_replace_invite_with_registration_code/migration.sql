/*
  Warnings:

  - You are about to drop the column `inviteCode` on the `therapists` table. All the data in the column will be lost.
  - You are about to drop the column `invitedBy` on the `therapists` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RegistrationCodeType" AS ENUM ('ONETIME', 'LIMITED', 'UNLIMITED');

-- DropForeignKey
ALTER TABLE "public"."therapists" DROP CONSTRAINT "therapists_invitedBy_fkey";

-- DropIndex
DROP INDEX "public"."therapists_inviteCode_key";

-- AlterTable
ALTER TABLE "therapists" DROP COLUMN "inviteCode",
DROP COLUMN "invitedBy",
ADD COLUMN     "registrationCodeId" TEXT;

-- CreateTable
CREATE TABLE "registration_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "codeType" "RegistrationCodeType" NOT NULL DEFAULT 'LIMITED',
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registration_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "registration_codes_code_key" ON "registration_codes"("code");

-- CreateIndex
CREATE INDEX "registration_codes_code_idx" ON "registration_codes"("code");

-- CreateIndex
CREATE INDEX "registration_codes_isActive_idx" ON "registration_codes"("isActive");

-- CreateIndex
CREATE INDEX "registration_codes_expiresAt_idx" ON "registration_codes"("expiresAt");

-- AddForeignKey
ALTER TABLE "therapists" ADD CONSTRAINT "therapists_registrationCodeId_fkey" FOREIGN KEY ("registrationCodeId") REFERENCES "registration_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

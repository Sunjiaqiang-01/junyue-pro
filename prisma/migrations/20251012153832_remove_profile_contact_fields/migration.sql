/*
  Warnings:

  - You are about to drop the column `phone` on the `therapist_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `qq` on the `therapist_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `wechat` on the `therapist_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "therapist_profiles" DROP COLUMN "phone",
DROP COLUMN "qq",
DROP COLUMN "wechat";

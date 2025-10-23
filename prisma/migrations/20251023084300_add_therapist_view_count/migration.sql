/*
  Warnings:

  - You are about to drop the column `cityId` on the `customer_services` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `customer_services` table. All the data in the column will be lost.
  - You are about to drop the `customer_service_cities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `site_visits` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `therapist_views` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."customer_service_cities" DROP CONSTRAINT "customer_service_cities_cityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."customer_service_cities" DROP CONSTRAINT "customer_service_cities_customerServiceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."customer_services" DROP CONSTRAINT "customer_services_cityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."therapist_views" DROP CONSTRAINT "therapist_views_therapistId_fkey";

-- DropIndex
DROP INDEX "public"."customer_services_cityId_idx";

-- AlterTable
ALTER TABLE "customer_services" DROP COLUMN "cityId",
DROP COLUMN "name";

-- AlterTable
ALTER TABLE "therapists" ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "public"."customer_service_cities";

-- DropTable
DROP TABLE "public"."site_visits";

-- DropTable
DROP TABLE "public"."therapist_views";

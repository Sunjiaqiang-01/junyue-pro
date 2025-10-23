/*
  Warnings:

  - Added the required column `name` to the `customer_services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: 先添加列为可空，然后更新现有数据，最后设为必填
ALTER TABLE "customer_services" ADD COLUMN     "cityId" TEXT;
ALTER TABLE "customer_services" ADD COLUMN     "name" TEXT;

-- 为现有数据设置默认值
UPDATE "customer_services" SET "name" = '默认客服' WHERE "name" IS NULL;

-- 将name列设为必填
ALTER TABLE "customer_services" ALTER COLUMN "name" SET NOT NULL;

-- CreateIndex
CREATE INDEX "customer_services_cityId_idx" ON "customer_services"("cityId");

-- AddForeignKey
ALTER TABLE "customer_services" ADD CONSTRAINT "customer_services_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `therapists` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `therapists` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."therapists_phone_key";

-- Step 1: 先添加可空的username和email字段
ALTER TABLE "therapists" ADD COLUMN "email" TEXT,
ADD COLUMN "username" TEXT,
ALTER COLUMN "phone" DROP NOT NULL;

-- Step 2: 为现有数据生成username（使用phone的后6位 + 随机数）
UPDATE "therapists" 
SET "username" = 'user_' || SUBSTRING("phone" FROM 6) || '_' || floor(random() * 1000)::text
WHERE "username" IS NULL;

-- Step 3: 将username设为NOT NULL
ALTER TABLE "therapists" ALTER COLUMN "username" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "therapists_username_key" ON "therapists"("username");

-- CreateIndex
CREATE INDEX "therapists_username_idx" ON "therapists"("username");

-- CreateIndex
CREATE INDEX "therapists_email_idx" ON "therapists"("email");

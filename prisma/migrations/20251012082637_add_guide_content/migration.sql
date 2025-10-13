-- CreateTable
CREATE TABLE "guide_contents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '必看攻略',
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guide_contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "guide_contents_isActive_idx" ON "guide_contents"("isActive");

-- CreateIndex
CREATE INDEX "guide_contents_order_idx" ON "guide_contents"("order");

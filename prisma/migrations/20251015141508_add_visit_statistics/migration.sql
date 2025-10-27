-- CreateTable
CREATE TABLE "site_visits" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT,
    "page" TEXT NOT NULL,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "therapist_views" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "therapist_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "site_visits_createdAt_idx" ON "site_visits"("createdAt");

-- CreateIndex
CREATE INDEX "site_visits_page_idx" ON "site_visits"("page");

-- CreateIndex
CREATE INDEX "therapist_views_therapistId_idx" ON "therapist_views"("therapistId");

-- CreateIndex
CREATE INDEX "therapist_views_createdAt_idx" ON "therapist_views"("createdAt");

-- AddForeignKey
ALTER TABLE "therapist_views" ADD CONSTRAINT "therapist_views_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "therapists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

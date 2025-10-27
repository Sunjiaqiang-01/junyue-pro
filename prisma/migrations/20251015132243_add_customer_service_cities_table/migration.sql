-- CreateTable
CREATE TABLE "customer_service_cities" (
    "id" TEXT NOT NULL,
    "customerServiceId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_service_cities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customer_service_cities_customerServiceId_idx" ON "customer_service_cities"("customerServiceId");

-- CreateIndex
CREATE INDEX "customer_service_cities_cityId_idx" ON "customer_service_cities"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_service_cities_customerServiceId_cityId_key" ON "customer_service_cities"("customerServiceId", "cityId");

-- AddForeignKey
ALTER TABLE "customer_service_cities" ADD CONSTRAINT "customer_service_cities_customerServiceId_fkey" FOREIGN KEY ("customerServiceId") REFERENCES "customer_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_service_cities" ADD CONSTRAINT "customer_service_cities_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "subscription_packages" (
    "id" SERIAL NOT NULL,
    "package_name" TEXT NOT NULL,
    "car_post_slot" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "duration" TEXT NOT NULL,

    CONSTRAINT "subscription_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_subscription" (
    "id" SERIAL NOT NULL,
    "package_id" INTEGER NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "amountPaid" DECIMAL(12,2) NOT NULL,
    "package_start_at" TIMESTAMP(3) NOT NULL,
    "package_end_at" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_subscription_vendor_id_key" ON "vendor_subscription"("vendor_id");

-- AddForeignKey
ALTER TABLE "vendor_subscription" ADD CONSTRAINT "vendor_subscription_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "subscription_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_subscription" ADD CONSTRAINT "vendor_subscription_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

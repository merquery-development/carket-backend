-- CreateTable
CREATE TABLE "customer_favorites_vendor" (
    "id" SERIAL NOT NULL,
    "customer_uid" TEXT NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_favorites_vendor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_favorites_vendor_customer_uid_vendor_id_key" ON "customer_favorites_vendor"("customer_uid", "vendor_id");

-- AddForeignKey
ALTER TABLE "customer_favorites_vendor" ADD CONSTRAINT "customer_favorites_vendor_customer_uid_fkey" FOREIGN KEY ("customer_uid") REFERENCES "customers"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_favorites_vendor" ADD CONSTRAINT "customer_favorites_vendor_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

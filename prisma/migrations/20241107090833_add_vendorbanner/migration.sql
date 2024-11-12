-- CreateTable
CREATE TABLE "VendorBanner" (
    "id" SERIAL NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "image_path" TEXT,
    "image_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorBanner_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VendorBanner" ADD CONSTRAINT "VendorBanner_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

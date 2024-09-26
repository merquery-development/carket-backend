-- DropForeignKey
ALTER TABLE "VendorUser" DROP CONSTRAINT "VendorUser_roleId_fkey";

-- DropForeignKey
ALTER TABLE "VendorUser" DROP CONSTRAINT "VendorUser_vendorId_fkey";

-- AlterTable
ALTER TABLE "VendorUser" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "vendorId" DROP NOT NULL,
ALTER COLUMN "roleId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "VendorUser" ADD CONSTRAINT "VendorUser_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorUser" ADD CONSTRAINT "VendorUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

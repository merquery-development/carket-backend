-- AlterTable
ALTER TABLE "VendorUser" ADD COLUMN     "is_enable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_login" TIMESTAMP(3);

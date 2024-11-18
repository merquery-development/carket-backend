/*
  Warnings:

  - You are about to drop the column `vendorId` on the `vendor_users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "vendor_users" DROP CONSTRAINT "vendor_users_vendorId_fkey";

-- AlterTable
ALTER TABLE "vendor_users" DROP COLUMN "vendorId",
ADD COLUMN     "vendor_id" INTEGER;

-- AddForeignKey
ALTER TABLE "vendor_users" ADD CONSTRAINT "vendor_users_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

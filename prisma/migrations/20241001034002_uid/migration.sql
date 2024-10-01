/*
  Warnings:

  - A unique constraint covering the columns `[uid]` on the table `VendorUser` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "VendorUser" ADD COLUMN     "uid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "VendorUser_uid_key" ON "VendorUser"("uid");

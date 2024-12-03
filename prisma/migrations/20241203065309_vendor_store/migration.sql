/*
  Warnings:

  - A unique constraint covering the columns `[uid]` on the table `vendors` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "store_image_name" TEXT,
ADD COLUMN     "store_image_path" TEXT,
ADD COLUMN     "uid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "vendors_uid_key" ON "vendors"("uid");

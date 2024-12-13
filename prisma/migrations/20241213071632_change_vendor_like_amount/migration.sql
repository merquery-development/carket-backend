/*
  Warnings:

  - You are about to drop the column `like_count` on the `customers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "customers" DROP COLUMN "like_count";

-- AlterTable
ALTER TABLE "vendor_banners" ADD COLUMN     "like_count" INTEGER DEFAULT 0;

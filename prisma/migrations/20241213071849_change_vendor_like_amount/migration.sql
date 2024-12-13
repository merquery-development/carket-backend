/*
  Warnings:

  - You are about to drop the column `like_count` on the `vendor_banners` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "vendor_banners" DROP COLUMN "like_count";

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "like_count" INTEGER DEFAULT 0;

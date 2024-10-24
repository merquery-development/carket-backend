/*
  Warnings:

  - You are about to alter the column `preDiscountPrice` on the `CarPost` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - Added the required column `view_count` to the `CarPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CarPost" ADD COLUMN     "view_count" INTEGER NOT NULL,
ALTER COLUMN "preDiscountPrice" SET DATA TYPE DECIMAL(12,2);

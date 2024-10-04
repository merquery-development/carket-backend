/*
  Warnings:

  - Added the required column `mileage` to the `CarPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "logo" TEXT;

-- AlterTable
ALTER TABLE "CarPost" ADD COLUMN     "mileage" INTEGER NOT NULL;

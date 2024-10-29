/*
  Warnings:

  - You are about to drop the column `logo_dark_bg_path` on the `Brand` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Brand" DROP COLUMN "logo_dark_bg_path",
ADD COLUMN     "logo_light_bg_name" TEXT;

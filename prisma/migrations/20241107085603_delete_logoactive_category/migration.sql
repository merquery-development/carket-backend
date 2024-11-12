/*
  Warnings:

  - You are about to drop the column `logo_name_active` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `logo_path_active` on the `Category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "logo_name_active",
DROP COLUMN "logo_path_active";

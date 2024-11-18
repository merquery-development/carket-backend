/*
  Warnings:

  - You are about to drop the column `(is_enable)` on the `customers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "customers" DROP COLUMN "(is_enable)",
ADD COLUMN     "is_enable" BOOLEAN NOT NULL DEFAULT true;

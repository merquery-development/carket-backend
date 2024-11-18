/*
  Warnings:

  - You are about to drop the column `(is_enable)` on the `vendor_users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "vendor_users" DROP COLUMN "(is_enable)",
ADD COLUMN     "is_enable" BOOLEAN NOT NULL DEFAULT true;

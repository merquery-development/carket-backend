/*
  Warnings:

  - You are about to drop the column `isActive` on the `vendor_subscription` table. All the data in the column will be lost.
  - Added the required column `is_active` to the `vendor_subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "vendor_subscription" DROP COLUMN "isActive",
ADD COLUMN     "is_active" BOOLEAN NOT NULL;

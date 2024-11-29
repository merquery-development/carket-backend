/*
  Warnings:

  - You are about to drop the column `duration` on the `subscription_packages` table. All the data in the column will be lost.
  - You are about to drop the column `amountPaid` on the `vendor_subscription` table. All the data in the column will be lost.
  - Added the required column `duration_in_day` to the `subscription_packages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount_paid` to the `vendor_subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "car_posts" ADD COLUMN     "favorite_count" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "subscription_packages" DROP COLUMN "duration",
ADD COLUMN     "duration_in_day" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "vendor_subscription" DROP COLUMN "amountPaid",
ADD COLUMN     "amount_paid" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "note" TEXT;

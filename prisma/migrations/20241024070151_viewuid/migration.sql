/*
  Warnings:

  - You are about to drop the column `customerId` on the `UserCarView` table. All the data in the column will be lost.
  - Added the required column `customerUid` to the `UserCarView` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserCarView" DROP CONSTRAINT "UserCarView_customerId_fkey";

-- AlterTable
ALTER TABLE "UserCarView" DROP COLUMN "customerId",
ADD COLUMN     "customerUid" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "UserCarView" ADD CONSTRAINT "UserCarView_customerUid_fkey" FOREIGN KEY ("customerUid") REFERENCES "Customer"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

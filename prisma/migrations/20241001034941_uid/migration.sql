/*
  Warnings:

  - A unique constraint covering the columns `[uid]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "uid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_uid_key" ON "Customer"("uid");

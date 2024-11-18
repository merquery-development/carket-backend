/*
  Warnings:

  - You are about to drop the column ` nick_name` on the `vendor_users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "vendor_users" DROP COLUMN " nick_name",
ADD COLUMN     "nick_name" TEXT;

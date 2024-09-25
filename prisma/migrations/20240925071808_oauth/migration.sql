/*
  Warnings:

  - You are about to drop the column `is_enable` on the `VendorUser` table. All the data in the column will be lost.
  - You are about to drop the column `last_login` on the `VendorUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "VendorUser" DROP COLUMN "is_enable",
DROP COLUMN "last_login",
ADD COLUMN     "is_oauth" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mobile_number" TEXT,
ADD COLUMN     "oauth_type" TEXT,
ADD COLUMN     "oauth_user_data" JSONB,
ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

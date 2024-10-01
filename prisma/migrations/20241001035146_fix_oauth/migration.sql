/*
  Warnings:

  - You are about to drop the column `is_oauth` on the `VendorUser` table. All the data in the column will be lost.
  - You are about to drop the column `oauth_type` on the `VendorUser` table. All the data in the column will be lost.
  - You are about to drop the column `oauth_user_data` on the `VendorUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     " nick_name" TEXT,
ADD COLUMN     "(is_enable)" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "is_oauth" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_login" TIMESTAMP(3),
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "mobile_number" TEXT,
ADD COLUMN     "oauth_type" TEXT,
ADD COLUMN     "oauth_user_data" JSONB,
ADD COLUMN     "profile_picture_name" TEXT,
ADD COLUMN     "profile_picture_path" TEXT,
ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VendorUser" DROP COLUMN "is_oauth",
DROP COLUMN "oauth_type",
DROP COLUMN "oauth_user_data";

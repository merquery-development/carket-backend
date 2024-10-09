/*
  Warnings:

  - You are about to drop the column `logo` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `pictureUrl` on the `CarPicture` table. All the data in the column will be lost.
  - Added the required column `picture_name` to the `CarPicture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `picture_path` to the `CarPicture` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Brand" DROP COLUMN "logo",
ADD COLUMN     "logo_name" TEXT,
ADD COLUMN     "logo_path" TEXT;

-- AlterTable
ALTER TABLE "CarPicture" DROP COLUMN "pictureUrl",
ADD COLUMN     "picture_name" TEXT NOT NULL,
ADD COLUMN     "picture_path" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "logo_name" TEXT,
ADD COLUMN     "logo_path" TEXT;

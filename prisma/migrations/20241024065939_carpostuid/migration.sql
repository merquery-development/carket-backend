/*
  Warnings:

  - A unique constraint covering the columns `[uid]` on the table `CarPost` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CarPost" ADD COLUMN     "uid" TEXT,
ALTER COLUMN "view_count" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CarPost_uid_key" ON "CarPost"("uid");

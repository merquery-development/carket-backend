/*
  Warnings:

  - You are about to drop the column `customer_id` on the `CustomerFavorite` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[customer_Uid,post_id]` on the table `CustomerFavorite` will be added. If there are existing duplicate values, this will fail.
  - Made the column `uid` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `customer_Uid` to the `CustomerFavorite` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CustomerFavorite" DROP CONSTRAINT "CustomerFavorite_customer_id_fkey";

-- DropIndex
DROP INDEX "CustomerFavorite_customer_id_post_id_key";

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "uid" SET NOT NULL;

-- AlterTable
ALTER TABLE "CustomerFavorite" DROP COLUMN "customer_id",
ADD COLUMN     "customer_Uid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CustomerFavorite_customer_Uid_post_id_key" ON "CustomerFavorite"("customer_Uid", "post_id");

-- AddForeignKey
ALTER TABLE "CustomerFavorite" ADD CONSTRAINT "CustomerFavorite_customer_Uid_fkey" FOREIGN KEY ("customer_Uid") REFERENCES "Customer"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

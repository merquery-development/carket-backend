/*
  Warnings:

  - You are about to drop the column `model` on the `cars` table. All the data in the column will be lost.
  - Added the required column `model_id` to the `cars` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "cars" DROP CONSTRAINT "cars_model_fkey";

-- AlterTable
ALTER TABLE "cars" DROP COLUMN "model",
ADD COLUMN     "model_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "cars" ADD CONSTRAINT "cars_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

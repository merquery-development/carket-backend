/*
  Warnings:

  - You are about to alter the column `basePrice` on the `Car` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE "Car" ALTER COLUMN "basePrice" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "CarPost" ALTER COLUMN "overrideSpecification" DROP NOT NULL;

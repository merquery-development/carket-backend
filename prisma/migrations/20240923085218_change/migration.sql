/*
  Warnings:

  - The primary key for the `Brand` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Brand` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Car` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Car` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `CarPicture` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `CarPicture` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `CarPost` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `CarPost` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Category` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Customer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Customer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Model` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Model` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Permission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Permission` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Role` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `RolePermission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `RolePermission` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `UserCarView` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `UserCarView` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Vendor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Vendor` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `VendorUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `VendorUser` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `categoryId` on the `Car` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `brandId` on the `Car` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `modelId` on the `Car` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `carId` on the `CarPicture` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `carId` on the `CarPost` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `vendorId` on the `CarPost` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `brandId` on the `Model` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `roleId` on the `RolePermission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `permissionId` on the `RolePermission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `customerId` on the `UserCarView` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `carId` on the `UserCarView` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `vendorId` on the `VendorUser` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `roleId` on the `VendorUser` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Car" DROP CONSTRAINT "Car_brandId_fkey";

-- DropForeignKey
ALTER TABLE "Car" DROP CONSTRAINT "Car_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Car" DROP CONSTRAINT "Car_modelId_fkey";

-- DropForeignKey
ALTER TABLE "CarPicture" DROP CONSTRAINT "CarPicture_carId_fkey";

-- DropForeignKey
ALTER TABLE "CarPost" DROP CONSTRAINT "CarPost_carId_fkey";

-- DropForeignKey
ALTER TABLE "CarPost" DROP CONSTRAINT "CarPost_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "Model" DROP CONSTRAINT "Model_brandId_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UserCarView" DROP CONSTRAINT "UserCarView_carId_fkey";

-- DropForeignKey
ALTER TABLE "UserCarView" DROP CONSTRAINT "UserCarView_customerId_fkey";

-- DropForeignKey
ALTER TABLE "VendorUser" DROP CONSTRAINT "VendorUser_roleId_fkey";

-- DropForeignKey
ALTER TABLE "VendorUser" DROP CONSTRAINT "VendorUser_vendorId_fkey";

-- AlterTable
ALTER TABLE "Brand" DROP CONSTRAINT "Brand_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Brand_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Car" DROP CONSTRAINT "Car_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "categoryId",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
DROP COLUMN "brandId",
ADD COLUMN     "brandId" INTEGER NOT NULL,
DROP COLUMN "modelId",
ADD COLUMN     "modelId" INTEGER NOT NULL,
ADD CONSTRAINT "Car_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "CarPicture" DROP CONSTRAINT "CarPicture_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "carId",
ADD COLUMN     "carId" INTEGER NOT NULL,
ADD CONSTRAINT "CarPicture_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "CarPost" DROP CONSTRAINT "CarPost_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "carId",
ADD COLUMN     "carId" INTEGER NOT NULL,
DROP COLUMN "vendorId",
ADD COLUMN     "vendorId" INTEGER NOT NULL,
ADD CONSTRAINT "CarPost_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Category" DROP CONSTRAINT "Category_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Category_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Customer_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Model" DROP CONSTRAINT "Model_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "brandId",
ADD COLUMN     "brandId" INTEGER NOT NULL,
ADD CONSTRAINT "Model_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Permission_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Role" DROP CONSTRAINT "Role_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "roleId",
ADD COLUMN     "roleId" INTEGER NOT NULL,
DROP COLUMN "permissionId",
ADD COLUMN     "permissionId" INTEGER NOT NULL,
ADD CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserCarView" DROP CONSTRAINT "UserCarView_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "customerId",
ADD COLUMN     "customerId" INTEGER NOT NULL,
DROP COLUMN "carId",
ADD COLUMN     "carId" INTEGER NOT NULL,
ADD CONSTRAINT "UserCarView_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "VendorUser" DROP CONSTRAINT "VendorUser_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "vendorId",
ADD COLUMN     "vendorId" INTEGER NOT NULL,
DROP COLUMN "roleId",
ADD COLUMN     "roleId" INTEGER NOT NULL,
ADD CONSTRAINT "VendorUser_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "VendorUser" ADD CONSTRAINT "VendorUser_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorUser" ADD CONSTRAINT "VendorUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarPost" ADD CONSTRAINT "CarPost_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarPost" ADD CONSTRAINT "CarPost_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarPicture" ADD CONSTRAINT "CarPicture_carId_fkey" FOREIGN KEY ("carId") REFERENCES "CarPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCarView" ADD CONSTRAINT "UserCarView_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCarView" ADD CONSTRAINT "UserCarView_carId_fkey" FOREIGN KEY ("carId") REFERENCES "CarPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

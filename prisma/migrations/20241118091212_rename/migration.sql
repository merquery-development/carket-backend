/*
  Warnings:

  - You are about to drop the `Brand` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Car` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CarPicture` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CarPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomerFavorite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Model` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RolePermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserCarView` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vendor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VendorBanner` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VendorUser` table. If the table is not empty, all the data it contains will be lost.

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
ALTER TABLE "CustomerFavorite" DROP CONSTRAINT "CustomerFavorite_customer_Uid_fkey";

-- DropForeignKey
ALTER TABLE "CustomerFavorite" DROP CONSTRAINT "CustomerFavorite_post_id_fkey";

-- DropForeignKey
ALTER TABLE "Model" DROP CONSTRAINT "Model_brandId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_carId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_customerId_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UserCarView" DROP CONSTRAINT "UserCarView_carId_fkey";

-- DropForeignKey
ALTER TABLE "UserCarView" DROP CONSTRAINT "UserCarView_customerUid_fkey";

-- DropForeignKey
ALTER TABLE "VendorBanner" DROP CONSTRAINT "VendorBanner_vendor_id_fkey";

-- DropForeignKey
ALTER TABLE "VendorUser" DROP CONSTRAINT "VendorUser_roleId_fkey";

-- DropForeignKey
ALTER TABLE "VendorUser" DROP CONSTRAINT "VendorUser_vendorId_fkey";

-- DropTable
DROP TABLE "Brand";

-- DropTable
DROP TABLE "Car";

-- DropTable
DROP TABLE "CarPicture";

-- DropTable
DROP TABLE "CarPost";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Customer";

-- DropTable
DROP TABLE "CustomerFavorite";

-- DropTable
DROP TABLE "Model";

-- DropTable
DROP TABLE "Permission";

-- DropTable
DROP TABLE "Review";

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "RolePermission";

-- DropTable
DROP TABLE "UserCarView";

-- DropTable
DROP TABLE "Vendor";

-- DropTable
DROP TABLE "VendorBanner";

-- DropTable
DROP TABLE "VendorUser";

-- CreateTable
CREATE TABLE "vendors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_banners" (
    "id" SERIAL NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "image_path" TEXT,
    "image_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_users" (
    "id" SERIAL NOT NULL,
    "uid" TEXT,
    "vendorId" INTEGER,
    "username" TEXT,
    "email" TEXT,
    "is_email_verified" BOOLEAN DEFAULT false,
    "mobile_number" TEXT,
    "last_login" TIMESTAMP(3),
    " nick_name" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "profile_picture_path" TEXT,
    "profile_picture_name" TEXT,
    "(is_enable)" BOOLEAN NOT NULL DEFAULT true,
    "password" TEXT,
    "role_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vendor_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_favorites" (
    "id" SERIAL NOT NULL,
    "customer_uid" TEXT NOT NULL,
    "post_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "mobile_number" TEXT,
    "last_login" TIMESTAMP(3),
    " nick_name" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "username" TEXT,
    "email" TEXT,
    "password" TEXT,
    "(is_enable)" BOOLEAN NOT NULL DEFAULT true,
    "profile_picture_path" TEXT,
    "profile_picture_name" TEXT,
    "is_oauth" BOOLEAN NOT NULL DEFAULT false,
    "oauth_type" TEXT,
    "oauth_user_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "car_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cars" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "model" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "specifications" JSONB,
    "base_price" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "car_view_count" INTEGER,

    CONSTRAINT "cars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "car_posts" (
    "id" SERIAL NOT NULL,
    "uid" TEXT,
    "car_id" INTEGER NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "year" INTEGER NOT NULL,
    "mileage" INTEGER NOT NULL,
    "override_specification" JSONB,
    "is_discount" BOOLEAN NOT NULL,
    "pre_discount_price" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "view_count" INTEGER,

    CONSTRAINT "car_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "logo_name" TEXT,
    "logo_path" TEXT,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" SERIAL NOT NULL,
    "logo_name" TEXT,
    "logo_path" TEXT,
    "logo_light_bg_name" TEXT,
    "logo_light_bg_path" TEXT,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "models" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "car_pictures" (
    "id" SERIAL NOT NULL,
    "car_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "picture_name" TEXT NOT NULL,
    "picture_path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "car_pictures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_car_views" (
    "id" SERIAL NOT NULL,
    "customer_uid" TEXT NOT NULL,
    "car_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_car_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_users_uid_key" ON "vendor_users"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "customer_favorites_customer_uid_post_id_key" ON "customer_favorites"("customer_uid", "post_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_uid_key" ON "customers"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "car_posts_uid_key" ON "car_posts"("uid");

-- AddForeignKey
ALTER TABLE "vendor_banners" ADD CONSTRAINT "vendor_banners_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_users" ADD CONSTRAINT "vendor_users_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_users" ADD CONSTRAINT "vendor_users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_favorites" ADD CONSTRAINT "customer_favorites_customer_uid_fkey" FOREIGN KEY ("customer_uid") REFERENCES "customers"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_favorites" ADD CONSTRAINT "customer_favorites_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "car_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "car_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cars" ADD CONSTRAINT "cars_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cars" ADD CONSTRAINT "cars_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cars" ADD CONSTRAINT "cars_model_fkey" FOREIGN KEY ("model") REFERENCES "models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_posts" ADD CONSTRAINT "car_posts_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_posts" ADD CONSTRAINT "car_posts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "models" ADD CONSTRAINT "models_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_pictures" ADD CONSTRAINT "car_pictures_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "car_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_car_views" ADD CONSTRAINT "user_car_views_customer_uid_fkey" FOREIGN KEY ("customer_uid") REFERENCES "customers"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_car_views" ADD CONSTRAINT "user_car_views_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "car_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

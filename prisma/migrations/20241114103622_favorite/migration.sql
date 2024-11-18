-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_carId_fkey";

-- CreateTable
CREATE TABLE "CustomerFavorite" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "post_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerFavorite_customer_id_post_id_key" ON "CustomerFavorite"("customer_id", "post_id");

-- AddForeignKey
ALTER TABLE "CustomerFavorite" ADD CONSTRAINT "CustomerFavorite_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerFavorite" ADD CONSTRAINT "CustomerFavorite_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "CarPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_carId_fkey" FOREIGN KEY ("carId") REFERENCES "CarPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

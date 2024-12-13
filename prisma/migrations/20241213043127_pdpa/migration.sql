-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "is_pdpa_acknowledged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pdpa_acknowledged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "pdpa_details" JSONB;

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "is_pdpa_acknowledged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pdpa_acknowledged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "pdpa_details" JSONB;

-- DropIndex
DROP INDEX "Notice_tripId_type_key";

-- AlterTable
ALTER TABLE "Notice" ADD COLUMN "body" TEXT;

-- CreateIndex
CREATE INDEX "Notice_tripId_type_idx" ON "Notice"("tripId", "type");

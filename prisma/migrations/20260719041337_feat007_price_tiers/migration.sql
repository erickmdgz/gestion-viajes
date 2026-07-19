-- CreateTable
CREATE TABLE "PriceTier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "minSize" INTEGER NOT NULL,
    "maxSize" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    CONSTRAINT "PriceTier_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PriceTier_tripId_idx" ON "PriceTier"("tripId");

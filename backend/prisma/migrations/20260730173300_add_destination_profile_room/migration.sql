-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" VARCHAR(160);

-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(64) NOT NULL,
    "nameKo" VARCHAR(100) NOT NULL,
    "countryCode" CHAR(2) NOT NULL,
    "timezone" VARCHAR(64) NOT NULL,
    "centerLatitude" DECIMAL(9,6) NOT NULL,
    "centerLongitude" DECIMAL(9,6) NOT NULL,
    "radiusKm" DECIMAL(6,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DestinationRoom" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(64) NOT NULL,
    "destinationId" TEXT NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DestinationRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Destination_slug_key" ON "Destination"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "DestinationRoom_slug_key" ON "DestinationRoom"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "DestinationRoom_destinationId_key" ON "DestinationRoom"("destinationId");

-- AddForeignKey
ALTER TABLE "DestinationRoom" ADD CONSTRAINT "DestinationRoom_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

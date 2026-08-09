-- CreateTable
CREATE TABLE "PlaceFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceMessageId" TEXT,
    "name" VARCHAR(100) NOT NULL,
    "address" VARCHAR(200),
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "provider" VARCHAR(20),
    "providerPlaceId" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaceFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlaceFavorite_userId_sourceMessageId_key" ON "PlaceFavorite"("userId", "sourceMessageId");

-- CreateIndex
CREATE INDEX "PlaceFavorite_userId_createdAt_id_idx" ON "PlaceFavorite"("userId", "createdAt", "id");

-- AddForeignKey
ALTER TABLE "PlaceFavorite" ADD CONSTRAINT "PlaceFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaceFavorite" ADD CONSTRAINT "PlaceFavorite_sourceMessageId_fkey" FOREIGN KEY ("sourceMessageId") REFERENCES "ChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

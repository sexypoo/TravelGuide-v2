-- AlterTable
ALTER TABLE "User" ADD COLUMN "travelStyles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "TravelRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(80) NOT NULL,
    "destination" VARCHAR(80) NOT NULL,
    "startedOn" DATE NOT NULL,
    "endedOn" DATE NOT NULL,
    "note" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TravelRecord_userId_startedOn_id_idx" ON "TravelRecord"("userId", "startedOn", "id");

-- AddForeignKey
ALTER TABLE "TravelRecord" ADD CONSTRAINT "TravelRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

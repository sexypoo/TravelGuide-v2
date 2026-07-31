-- CreateEnum
CREATE TYPE "QuestionCategory" AS ENUM ('WEATHER', 'TRANSPORT', 'FOOD', 'PLACE', 'SAFETY', 'OTHER');

-- CreateEnum
CREATE TYPE "QuestionUrgency" AS ENUM ('NORMAL', 'URGENT');

-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('OPEN', 'RESOLVED', 'REMOVED');

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "category" "QuestionCategory" NOT NULL,
    "urgency" "QuestionUrgency" NOT NULL,
    "content" VARCHAR(1000) NOT NULL,
    "areaText" VARCHAR(60),
    "status" "QuestionStatus" NOT NULL DEFAULT 'OPEN',
    "acceptedAnswerId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),
    "removedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Question_acceptedAnswerId_key" ON "Question"("acceptedAnswerId");

-- CreateIndex
CREATE INDEX "Question_roomId_status_createdAt_id_idx" ON "Question"("roomId", "status", "createdAt", "id");

-- CreateIndex
CREATE INDEX "Question_authorId_status_idx" ON "Question"("authorId", "status");

-- CreateIndex
CREATE INDEX "Question_expiresAt_idx" ON "Question"("expiresAt");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "DestinationRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_removedById_fkey" FOREIGN KEY ("removedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

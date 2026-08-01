-- AlterEnum
ALTER TYPE "QuestionCategory" ADD VALUE 'WAITING';
ALTER TYPE "QuestionCategory" ADD VALUE 'CROWD';
ALTER TYPE "QuestionCategory" ADD VALUE 'OPEN_HOURS';
ALTER TYPE "QuestionCategory" ADD VALUE 'EVENT';

-- CreateEnum
CREATE TYPE "ChatMessageType" AS ENUM ('TEXT', 'IMAGE', 'PLACE', 'TOPIC_SHARE');
CREATE TYPE "CrowdLevel" AS ENUM ('QUIET', 'MODERATE', 'BUSY', 'VERY_BUSY');
CREATE TYPE "EntryStatus" AS ENUM ('OPEN', 'LIMITED', 'PAUSED', 'CLOSED', 'UNKNOWN');

-- AlterTable
ALTER TABLE "ChatMessage"
ADD COLUMN "type" "ChatMessageType" NOT NULL DEFAULT 'TEXT',
ADD COLUMN "imageObjectKey" VARCHAR(255),
ADD COLUMN "imageOriginalName" VARCHAR(255),
ADD COLUMN "imageMimeType" VARCHAR(64),
ADD COLUMN "imageSizeBytes" INTEGER,
ADD COLUMN "placeName" VARCHAR(100),
ADD COLUMN "placeAddress" VARCHAR(200),
ADD COLUMN "placeLatitude" DECIMAL(9,6),
ADD COLUMN "placeLongitude" DECIMAL(9,6),
ADD COLUMN "sharedQuestionId" TEXT;

ALTER TABLE "Answer"
ADD COLUMN "waitMinutes" INTEGER,
ADD COLUMN "crowdLevel" "CrowdLevel",
ADD COLUMN "entryStatus" "EntryStatus",
ADD COLUMN "observedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ChatMessage_sharedQuestionId_idx" ON "ChatMessage"("sharedQuestionId");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sharedQuestionId_fkey" FOREIGN KEY ("sharedQuestionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

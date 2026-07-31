CREATE TYPE "RoomParticipantKind" AS ENUM ('TRAVELER', 'LOCAL', 'BOTH');

ALTER TABLE "Question"
ADD COLUMN "authorKind" "RoomParticipantKind" NOT NULL DEFAULT 'TRAVELER',
ADD COLUMN "sourceMessageId" TEXT;

CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorKind" "RoomParticipantKind" NOT NULL,
    "content" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Question_sourceMessageId_key" ON "Question"("sourceMessageId");
CREATE INDEX "ChatMessage_roomId_createdAt_id_idx" ON "ChatMessage"("roomId", "createdAt", "id");
CREATE INDEX "ChatMessage_authorId_createdAt_idx" ON "ChatMessage"("authorId", "createdAt");

ALTER TABLE "Question" ADD CONSTRAINT "Question_sourceMessageId_fkey"
FOREIGN KEY ("sourceMessageId") REFERENCES "ChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_roomId_fkey"
FOREIGN KEY ("roomId") REFERENCES "DestinationRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_authorId_fkey"
FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

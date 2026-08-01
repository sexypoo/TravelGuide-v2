-- Existing answers were created under the former local-only policy.
ALTER TABLE "Answer"
ADD COLUMN "authorKind" "RoomParticipantKind" NOT NULL DEFAULT 'LOCAL';

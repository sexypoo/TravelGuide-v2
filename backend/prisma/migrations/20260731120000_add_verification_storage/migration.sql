-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('TRAVELER', 'LOCAL');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "LocalProofType" AS ENUM ('RESIDENCE', 'WORK', 'STUDY', 'OTHER');

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "type" "VerificationType" NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "localProofType" "LocalProofType",
    "proofObjectKey" VARCHAR(255) NOT NULL,
    "proofOriginalName" VARCHAR(255) NOT NULL,
    "proofMimeType" VARCHAR(64) NOT NULL,
    "proofSizeBytes" INTEGER NOT NULL,
    "gpsLat" DECIMAL(9,6),
    "gpsLng" DECIMAL(9,6),
    "gpsAccuracyMeters" INTEGER,
    "gpsCapturedAt" TIMESTAMP(3),
    "submittedNote" VARCHAR(300),
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" VARCHAR(300),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Verification_userId_destinationId_type_status_idx" ON "Verification"("userId", "destinationId", "type", "status");

-- CreateIndex
CREATE INDEX "Verification_status_createdAt_idx" ON "Verification"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Verification_destinationId_type_status_idx" ON "Verification"("destinationId", "type", "status");

-- Prevent duplicate pending applications under concurrent requests.
CREATE UNIQUE INDEX "Verification_one_pending_per_user_destination_type" ON "Verification"("userId", "destinationId", "type") WHERE "status" = 'PENDING';

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

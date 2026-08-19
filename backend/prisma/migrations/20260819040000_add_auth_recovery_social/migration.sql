-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'KAKAO', 'APPLE');

-- AlterTable
ALTER TABLE "User"
  ALTER COLUMN "passwordHash" DROP NOT NULL,
  ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "AuthIdentity" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" "AuthProvider" NOT NULL,
  "providerUserId" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AuthIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" CHAR(64) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthIdentity_provider_providerUserId_key"
  ON "AuthIdentity"("provider", "providerUserId");
CREATE UNIQUE INDEX "AuthIdentity_userId_provider_key"
  ON "AuthIdentity"("userId", "provider");
CREATE INDEX "AuthIdentity_userId_idx" ON "AuthIdentity"("userId");
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key"
  ON "PasswordResetToken"("tokenHash");
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx"
  ON "PasswordResetToken"("userId", "expiresAt");
CREATE INDEX "PasswordResetToken_expiresAt_usedAt_idx"
  ON "PasswordResetToken"("expiresAt", "usedAt");

-- AddForeignKey
ALTER TABLE "AuthIdentity" ADD CONSTRAINT "AuthIdentity_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

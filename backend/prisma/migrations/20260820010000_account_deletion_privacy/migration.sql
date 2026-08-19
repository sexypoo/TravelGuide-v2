-- Keep the Sign in with Apple refresh token encrypted at rest so it can be
-- revoked when the owner permanently deletes the account.
ALTER TABLE "AuthIdentity"
ADD COLUMN "refreshTokenCiphertext" TEXT;

CREATE TABLE "PreorderRegistration" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "consentedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreorderRegistration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PreorderRegistration_email_key"
ON "PreorderRegistration"("email");

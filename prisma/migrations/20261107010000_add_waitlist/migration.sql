CREATE TABLE "waitlist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "invitedAt" TIMESTAMP(3),
    CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "waitlist_email_key" ON "waitlist"("email");

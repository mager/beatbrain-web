-- Delivery state prevents a second send after an uncertain provider result.
CREATE TYPE "InviteEmailStatus" AS ENUM ('UNSENT', 'SENDING', 'SENT', 'FAILED', 'UNKNOWN');
ALTER TABLE "invites"
  ADD COLUMN "emailStatus" "InviteEmailStatus" NOT NULL DEFAULT 'UNSENT',
  ADD COLUMN "emailSentAt" TIMESTAMP(3),
  ADD COLUMN "emailAttemptedAt" TIMESTAMP(3),
  ADD COLUMN "emailMessageId" TEXT;

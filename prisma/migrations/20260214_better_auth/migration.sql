-- Migration: NextAuth -> Better Auth
-- Converts int IDs to string IDs, renames tables, restructures schema

-- 1. Drop old NextAuth tables (sessions, accounts, verificationtokens)
DROP TABLE IF EXISTS "sessions" CASCADE;
DROP TABLE IF EXISTS "accounts" CASCADE;
DROP TABLE IF EXISTS "verificationtokens" CASCADE;

-- 2. Convert users table to Better Auth schema

-- Remove the old password column default/constraint if exists
-- Add new columns first
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "displayUsername" TEXT;

-- Convert id from int to text
-- First, update posts.authorId to text
ALTER TABLE "posts" DROP CONSTRAINT IF EXISTS "posts_authorId_fkey";
ALTER TABLE "posts" ALTER COLUMN "authorId" TYPE TEXT USING "authorId"::TEXT;

-- Now convert User id
ALTER TABLE "users" ALTER COLUMN "id" TYPE TEXT USING "id"::TEXT;
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;
-- Drop the old sequence if it exists
DROP SEQUENCE IF EXISTS "users_id_seq" CASCADE;

-- Convert emailVerified from timestamp to boolean
ALTER TABLE "users" ALTER COLUMN "email_verified" TYPE BOOLEAN USING CASE WHEN "email_verified" IS NOT NULL THEN TRUE ELSE FALSE END;
ALTER TABLE "users" ALTER COLUMN "email_verified" SET DEFAULT FALSE;
ALTER TABLE "users" ALTER COLUMN "email_verified" SET NOT NULL;

-- Make name and email NOT NULL (set defaults for any nulls first)
UPDATE "users" SET "name" = 'User' WHERE "name" IS NULL;
UPDATE "users" SET "email" = "id" || '@unknown.local' WHERE "email" IS NULL;
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;

-- Drop password column (Better Auth stores passwords in account table)
ALTER TABLE "users" DROP COLUMN IF EXISTS "password";

-- Rename the table
ALTER TABLE "users" RENAME TO "user";

-- Rename columns to match Better Auth
ALTER TABLE "user" RENAME COLUMN "email_verified" TO "emailVerified";
ALTER TABLE "user" RENAME COLUMN "created_at" TO "createdAt";
ALTER TABLE "user" RENAME COLUMN "updated_at" TO "updatedAt";

-- Re-add the posts FK
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. Create Better Auth session table
CREATE TABLE "session" (
  "id" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "token" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "session_token_key" ON "session"("token");
CREATE INDEX "session_userId_idx" ON "session"("userId");
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Create Better Auth account table
CREATE TABLE "account" (
  "id" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP(3),
  "refreshTokenExpiresAt" TIMESTAMP(3),
  "scope" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "account_userId_idx" ON "account"("userId");
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Create Better Auth verification table
CREATE TABLE "verification" (
  "id" TEXT NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

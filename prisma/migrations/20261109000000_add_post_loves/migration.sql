CREATE TABLE "post_loves" (
    "postId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "post_loves_pkey" PRIMARY KEY ("postId", "userId")
);
CREATE INDEX "post_loves_userId_idx" ON "post_loves"("userId");
ALTER TABLE "post_loves" ADD CONSTRAINT "post_loves_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_loves" ADD CONSTRAINT "post_loves_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

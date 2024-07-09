/*
  Warnings:

  - A unique constraint covering the columns `[source,sourceId]` on the table `Track` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Track_source_sourceId_key" ON "Track"("source", "sourceId");

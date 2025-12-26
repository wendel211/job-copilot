/*
  Warnings:

  - A unique constraint covering the columns `[sourceType,sourceKey]` on the table `Job` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Job_companyId_idx";

-- DropIndex
DROP INDEX "Job_title_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Job_sourceType_sourceKey_key" ON "Job"("sourceType", "sourceKey");

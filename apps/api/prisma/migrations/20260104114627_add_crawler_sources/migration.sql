-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "JobSourceType" ADD VALUE 'linkedin';
ALTER TYPE "JobSourceType" ADD VALUE 'gupy';
ALTER TYPE "JobSourceType" ADD VALUE 'workday';
ALTER TYPE "JobSourceType" ADD VALUE 'adzuna';
ALTER TYPE "JobSourceType" ADD VALUE 'programathor';
ALTER TYPE "JobSourceType" ADD VALUE 'remotive';

-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "sourceType" SET DEFAULT 'manual';

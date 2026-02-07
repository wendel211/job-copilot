-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "descriptionEditedAt" TIMESTAMP(3),
ADD COLUMN     "descriptionSource" TEXT NOT NULL DEFAULT 'auto';

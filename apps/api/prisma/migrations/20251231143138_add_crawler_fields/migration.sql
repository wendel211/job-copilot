-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "atsProvider" "AtsType",
ADD COLUMN     "careerPageUrl" TEXT,
ADD COLUMN     "lastCrawledAt" TIMESTAMP(3);

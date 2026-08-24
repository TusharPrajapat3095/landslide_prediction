-- AlterTable
ALTER TABLE "MitigationMeasure" ADD COLUMN     "costLevel" TEXT NOT NULL DEFAULT 'unknown',
ADD COLUMN     "effectiveness" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "installationTime" TEXT NOT NULL DEFAULT 'unknown',
ADD COLUMN     "landslideType" TEXT NOT NULL DEFAULT 'unknown';

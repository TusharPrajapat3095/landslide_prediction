-- CreateTable
CREATE TABLE "MitigationMeasure" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "MitigationMeasure_pkey" PRIMARY KEY ("id")
);

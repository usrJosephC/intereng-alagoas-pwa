-- CreateEnum
CREATE TYPE "Category" AS ENUM ('MASCULINO', 'FEMININO');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'ORGANIZADOR';
ALTER TYPE "Role" ADD VALUE 'SUMULA';

-- DropIndex
DROP INDEX "Group_sport_idx";

-- DropIndex
DROP INDEX "Match_sport_idx";

-- DropIndex
DROP INDEX "Team_atleticaId_sport_key";

-- DropIndex
DROP INDEX "Team_sport_idx";

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'MASCULINO';

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'MASCULINO',
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'MASCULINO';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "city" TEXT,
ADD COLUMN     "course" TEXT,
ADD COLUMN     "institution" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "sponsorConsent" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Group_sport_category_idx" ON "Group"("sport", "category");

-- CreateIndex
CREATE INDEX "Match_sport_category_idx" ON "Match"("sport", "category");

-- CreateIndex
CREATE INDEX "Team_sport_category_idx" ON "Team"("sport", "category");

-- CreateIndex
CREATE UNIQUE INDEX "Team_atleticaId_sport_category_key" ON "Team"("atleticaId", "sport", "category");


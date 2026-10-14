DELETE FROM "scans";

-- DropIndex
DROP INDEX "scans_started_at_id_idx";

-- AlterTable
ALTER TABLE "scans" ADD COLUMN     "organization_id" TEXT NOT NULL,
ADD COLUMN     "started_by_name" TEXT,
ADD COLUMN     "started_by_user_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "scans_organization_started_at_idx" ON "scans"("organization_id", "started_at" DESC, "id" DESC);

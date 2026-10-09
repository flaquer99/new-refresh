-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "scan_status" AS ENUM ('running', 'completed', 'cancelled', 'failed');

-- CreateEnum
CREATE TYPE "report_outcome" AS ENUM ('complete', 'cancelled', 'page-limit-reached', 'time-limit-reached');

-- CreateTable
CREATE TABLE "scans" (
    "id" UUID NOT NULL,
    "start_url" TEXT NOT NULL,
    "depth" INTEGER NOT NULL,
    "status" "scan_status" NOT NULL,
    "outcome" "report_outcome",
    "origin" TEXT,
    "error_code" TEXT,
    "error_message" TEXT,
    "pages_scanned" INTEGER NOT NULL DEFAULT 0,
    "violations_critical" INTEGER NOT NULL DEFAULT 0,
    "violations_serious" INTEGER NOT NULL DEFAULT 0,
    "violations_moderate" INTEGER NOT NULL DEFAULT 0,
    "violations_minor" INTEGER NOT NULL DEFAULT 0,
    "total_violations" INTEGER NOT NULL DEFAULT 0,
    "needs_review_count" INTEGER NOT NULL DEFAULT 0,
    "report" JSONB,
    "report_version" INTEGER,
    "started_at" TIMESTAMPTZ(3) NOT NULL,
    "finished_at" TIMESTAMPTZ(3),
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "scans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scans_started_at_id_idx" ON "scans"("started_at" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "scans_status_started_at_idx" ON "scans"("status", "started_at");

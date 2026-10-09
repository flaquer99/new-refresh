import type { Scan } from "../generated/prisma/client.js";
import {
  buildSampleReport,
  SAMPLE_SCAN_ID,
  SAMPLE_START_URL,
  SAMPLE_STARTED_AT,
} from "./sample-result.js";

export const buildScanRow = (overrides: Partial<Scan> = {}): Scan => ({
  id: SAMPLE_SCAN_ID,
  startUrl: SAMPLE_START_URL,
  depth: 1,
  status: "completed",
  outcome: "page_limit_reached",
  origin: "https://www.example.org",
  errorCode: null,
  errorMessage: null,
  pagesScanned: 50,
  violationsCritical: 2,
  violationsSerious: 11,
  violationsModerate: 4,
  violationsMinor: 0,
  totalViolations: 17,
  needsReviewCount: 9,
  report: buildSampleReport(),
  reportVersion: 1,
  startedAt: SAMPLE_STARTED_AT,
  finishedAt: SAMPLE_STARTED_AT,
  updatedAt: SAMPLE_STARTED_AT,
  ...overrides,
});

import { SCAN_INTERRUPTED_MESSAGE } from "@refresh/scan-contracts/errors";
import type { Violation } from "@refresh/scan-contracts/findings";
import type { ScanReport } from "@refresh/scan-contracts/report";
import type { ScanResult } from "@refresh/scan-contracts/scan-result";

export const SAMPLE_SCAN_ID = "0b8f3c52-2f8e-4c1a-9a51-6a3f1c2d7e90";
export const SAMPLE_START_URL = "https://www.example.org/";
export const SAMPLE_STARTED_AT = new Date("2026-10-09T10:00:00.000Z");
export const SAMPLE_FINISHED_AT = "2026-10-09T10:05:00.000Z";

const CONTRAST_VIOLATION: Violation = {
  id: "2b7d",
  ruleId: "color-contrast",
  criteria: [
    {
      id: "1.4.3",
      name: "Contrast (Minimum)",
      level: "AA",
      understandingUrl:
        "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
    },
  ],
  level: "AA",
  severity: "serious",
  pageUrl: SAMPLE_START_URL,
  selector: "footer > p.legal",
  html: '<p class="legal">© 2026 Example</p>',
  viewports: ["desktop", "mobile"],
  description: "Elements must meet minimum color contrast ratio thresholds",
  fixGuidance: "Fix any of the following: insufficient color contrast",
};

export const buildSampleReport = (
  overrides: Partial<ScanReport> = {},
): ScanReport => ({
  startUrl: SAMPLE_START_URL,
  origin: "https://www.example.org",
  depth: 1,
  outcome: "page-limit-reached",
  startedAt: SAMPLE_STARTED_AT.toISOString(),
  finishedAt: SAMPLE_FINISHED_AT,
  summary: {
    pagesScanned: 50,
    pagesSkipped: 2,
    pagesFailed: 1,
    totalViolations: 17,
    violationsBySeverity: { critical: 2, serious: 11, moderate: 4, minor: 0 },
    violationsByLevel: { A: 6, AA: 11 },
    needsReviewCount: 9,
  },
  violations: [CONTRAST_VIOLATION],
  reviewItems: [],
  manualChecks: [],
  pages: [
    {
      url: SAMPLE_START_URL,
      depth: 0,
      status: "scanned",
      reason: null,
      httpStatus: 200,
    },
  ],
  ...overrides,
});

export const buildCompletedResult = (
  overrides: Partial<ScanResult> = {},
): ScanResult => ({
  scanId: SAMPLE_SCAN_ID,
  status: "completed",
  report: buildSampleReport(),
  error: null,
  finishedAt: SAMPLE_FINISHED_AT,
  ...overrides,
});

export const buildInterruptedResult = (): ScanResult => ({
  scanId: SAMPLE_SCAN_ID,
  status: "failed",
  report: null,
  error: { code: "SCAN_INTERRUPTED", message: SCAN_INTERRUPTED_MESSAGE },
  finishedAt: SAMPLE_FINISHED_AT,
});

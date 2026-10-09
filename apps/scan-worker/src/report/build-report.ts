import type { PageResult } from "@refresh/scan-contracts/page-result";
import type { ReportOutcome, ScanReport } from "@refresh/scan-contracts/report";
import {
  aggregateManualChecks,
  type PageProbeMatches,
} from "./aggregate-manual-checks.js";
import type { AxeRun } from "./axe-results.js";
import { buildSummary } from "./build-summary.js";
import { mapReviewItems } from "./map-review-items.js";
import { mapViolations } from "./map-violations.js";

export const OUTCOME_BY_STOP_REASON = {
  completed: "complete",
  "page-limit": "page-limit-reached",
  cancelled: "cancelled",
  deadline: "time-limit-reached",
} as const satisfies Record<string, ReportOutcome>;

export type ScanStopReason = keyof typeof OUTCOME_BY_STOP_REASON;

export type BuildReportInput = {
  scan: Pick<
    ScanReport,
    "startUrl" | "origin" | "depth" | "startedAt" | "finishedAt"
  >;
  stopReason: ScanStopReason;
  pages: readonly PageResult[];
  findings: {
    axeRuns: readonly AxeRun[];
    probeMatches: readonly PageProbeMatches[];
  };
};

export const buildReport = ({
  scan,
  stopReason,
  pages,
  findings,
}: BuildReportInput): ScanReport => {
  const violations = mapViolations(findings.axeRuns);
  const reviewItems = mapReviewItems(findings.axeRuns);
  const manualChecks = aggregateManualChecks(findings.probeMatches);
  return {
    ...scan,
    outcome: OUTCOME_BY_STOP_REASON[stopReason],
    summary: buildSummary({ violations, reviewItems, manualChecks, pages }),
    violations,
    reviewItems,
    manualChecks,
    pages: [...pages],
  };
};

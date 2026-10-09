import type { PageResult } from "@refresh/scan-contracts/page-result";
import type { ScanReport } from "@refresh/scan-contracts/report";
import type { PageAuditResult } from "../audit/page-audit-result.js";
import { mapReviewItems } from "../report/map-review-items.js";
import { mapViolations } from "../report/map-violations.js";
import type { ScanLogger } from "./scan-logger.js";

type AuditedPage = Extract<PageAuditResult, { kind: "audited" }>;

const pathOf = (url: string): string => new URL(url).pathname;

const logAudited = (
  logger: ScanLogger,
  path: string,
  { findings, durationsMs }: AuditedPage,
) => {
  for (const run of findings.axeRuns) {
    logger.info(
      {
        event: "page.audited",
        path,
        viewport: run.viewport,
        durationMs: durationsMs[run.viewport] ?? null,
        violations: mapViolations([run]).length,
        reviewItems: mapReviewItems([run]).length,
      },
      "page.audited",
    );
  }
};

export const logPageOutcome = (
  logger: ScanLogger,
  page: PageResult,
  result: PageAuditResult,
) => {
  const path = pathOf(page.url);
  if (result.kind === "audited") {
    logAudited(logger, path, result);
    return;
  }
  const event = result.kind === "failed" ? "page.failed" : "page.skipped";
  const { reason, httpStatus } = page;
  logger.info({ event, path, reason, httpStatus }, event);
};

export const logScanFinished = (
  logger: ScanLogger,
  { outcome, summary }: ScanReport,
  durationMs: number,
) =>
  logger.info(
    {
      event: "scan.finished",
      outcome,
      pagesScanned: summary.pagesScanned,
      durationMs,
    },
    "scan.finished",
  );

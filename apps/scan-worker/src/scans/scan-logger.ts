import type { Viewport } from "@refresh/scan-contracts/findings";
import type { PageReason } from "@refresh/scan-contracts/page-result";
import type { ReportOutcome } from "@refresh/scan-contracts/report";
import type { RobotsLogger } from "../crawl/robots-text.js";

export type PageAuditedLog = {
  event: "page.audited";
  path: string;
  viewport: Viewport;
  durationMs: number | null;
  violations: number;
  reviewItems: number;
};

export type PageOutcomeLog = {
  event: "page.failed" | "page.skipped";
  path: string;
  reason: PageReason | null;
  httpStatus: number | null;
};

export type ScanFinishedLog = {
  event: "scan.finished";
  outcome: ReportOutcome;
  pagesScanned: number;
  durationMs: number;
};

export type ScanInfoLog = PageAuditedLog | PageOutcomeLog | ScanFinishedLog;

export type ScanLogger = RobotsLogger & {
  info: (details: ScanInfoLog, message: string) => void;
  child: (bindings: { scanId: string }) => ScanLogger;
};

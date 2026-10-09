import type { ScanReport } from "@refresh/scan-contracts/report";
import type { ScanRequest } from "@refresh/scan-contracts/scan-request";
import type { ScanProgress } from "@refresh/scan-contracts/scan-status";
import type { PageAuditor } from "../audit/page-auditor.js";
import type { GuardedFetch } from "../network/guarded-fetch.js";
import { buildReport } from "../report/build-report.js";
import { crawlSite } from "./crawl-site.js";
import type { CrawlOutcome } from "./finish-crawl.js";
import { startScanDeadline } from "./scan-deadline.js";
import { logScanFinished } from "./scan-events.js";
import type { ScanLogger } from "./scan-logger.js";

export type ScanAuditor = PageAuditor & { close: () => Promise<void> };

export type ScanRunnerDeps = {
  openAuditor: () => Promise<ScanAuditor>;
  fetch: GuardedFetch;
  logger: ScanLogger;
  pageDelayMs?: number;
};

export type RunScanInput = {
  scanId: string;
  request: ScanRequest;
  signal: AbortSignal;
  onProgress: (progress: ScanProgress) => void;
};

export type ScanRunner = (input: RunScanInput) => Promise<ScanReport>;

const isoTime = (ms: number): string => new Date(ms).toISOString();

const finishReport = (
  { request }: RunScanInput,
  crawl: CrawlOutcome,
  startedMs: number,
): ScanReport =>
  buildReport({
    scan: {
      startUrl: request.url,
      origin: crawl.origin,
      depth: request.depth,
      startedAt: isoTime(startedMs),
      finishedAt: isoTime(Date.now()),
    },
    stopReason: crawl.stopReason,
    pages: crawl.pages,
    findings: crawl.findings,
  });

export const createScanRunner =
  (deps: ScanRunnerDeps): ScanRunner =>
  async (input) => {
    const startedMs = Date.now();
    const logger = deps.logger.child({ scanId: input.scanId });
    const auditor = await deps.openAuditor();
    const deadline = startScanDeadline(input.signal);
    try {
      const crawl = await crawlSite({
        deps: { ...deps, logger },
        auditor,
        input: { ...input, signal: deadline.signal },
      });
      const report = finishReport(input, crawl, startedMs);
      logScanFinished(logger, report, Date.now() - startedMs);
      return report;
    } finally {
      deadline.clear();
      await auditor.close();
    }
  };

import type { PageResult } from "@refresh/scan-contracts/page-result";
import type { FrontierEntry } from "../crawl/crawl-frontier.js";
import type { ScanStopReason } from "../report/build-report.js";
import type { CrawlState } from "./crawl-state.js";
import { isDeadlineAbort } from "./scan-deadline.js";

export type CrawlOutcome = Pick<CrawlState, "origin" | "pages" | "findings"> & {
  stopReason: ScanStopReason;
};

export const notReached = ({ url, depth }: FrontierEntry): PageResult => ({
  url,
  depth,
  status: "skipped",
  reason: "not-reached",
  httpStatus: null,
});

const stopReasonOf = (
  { frontier }: CrawlState,
  signal: AbortSignal,
): ScanStopReason => {
  if (signal.aborted) {
    return isDeadlineAbort(signal) ? "deadline" : "cancelled";
  }
  return frontier.limitReached() ? "page-limit" : "completed";
};

export const finishCrawl = (
  state: CrawlState,
  signal: AbortSignal,
): CrawlOutcome => {
  const { origin, pages, findings, frontier } = state;
  return {
    origin,
    pages: [...pages, ...frontier.leftovers().map(notReached)],
    findings,
    stopReason: stopReasonOf(state, signal),
  };
};

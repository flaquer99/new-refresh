import type { PageResult } from "@refresh/scan-contracts/page-result";
import type { FrontierEntry } from "../crawl/crawl-frontier.js";
import { ABORTED, raceAbort, sleep } from "./abortable.js";
import { type CrawlContext, START_DEPTH } from "./crawl-context.js";
import type { CrawlState } from "./crawl-state.js";
import { PAGE_DELAY_MS } from "./scan-limits.js";

const attemptedCount = (pages: readonly PageResult[]): number =>
  pages.filter(({ reason }) => reason !== "robots-disallowed").length;

export const reportProgress = (
  { input }: CrawlContext,
  state: CrawlState,
  currentUrl: string,
) =>
  input.onProgress({
    pagesScanned: attemptedCount(state.pages),
    pagesDiscovered: state.frontier.discoveredCount(),
    currentUrl,
  });

const pause = async ({ deps, input }: CrawlContext, entry: FrontierEntry) => {
  if (entry.depth !== START_DEPTH) {
    await sleep(deps.pageDelayMs ?? PAGE_DELAY_MS, input.signal);
  }
};

export const auditUnlessAborted = async (
  context: CrawlContext,
  state: CrawlState,
  entry: FrontierEntry,
) => {
  const { url, depth } = entry;
  const { signal } = context.input;
  await pause(context, entry);
  if (signal.aborted) {
    return ABORTED;
  }
  reportProgress(context, state, url);
  const isStartPage = depth === START_DEPTH;
  return raceAbort(context.auditor.audit({ url, isStartPage }), signal);
};

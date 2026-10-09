import type { FrontierEntry } from "../crawl/crawl-frontier.js";
import { loadRobotsPolicy } from "../crawl/robots-policy.js";
import { ABORTED } from "./abortable.js";
import { auditUnlessAborted, reportProgress } from "./audit-entry.js";
import { type CrawlContext, START_DEPTH } from "./crawl-context.js";
import {
  type CrawlState,
  createCrawlState,
  recordPage,
} from "./crawl-state.js";
import { type CrawlOutcome, finishCrawl, notReached } from "./finish-crawl.js";
import { logPageOutcome } from "./scan-events.js";
import { assertStartPageReachable } from "./scan-failed-error.js";

const adoptStartPage = async (
  { deps }: CrawlContext,
  state: CrawlState,
  startUrl: string,
) => {
  const { fetch, logger } = deps;
  state.origin = new URL(startUrl).origin;
  state.robots = await loadRobotsPolicy({ startUrl, fetch, logger });
};

const visitPage = async (
  context: CrawlContext,
  state: CrawlState,
  entry: FrontierEntry,
) => {
  const result = await auditUnlessAborted(context, state, entry);
  if (result === ABORTED) {
    state.pages.push(notReached(entry));
    return;
  }
  const isStartPage = entry.depth === START_DEPTH;
  if (isStartPage && result.kind === "audited") {
    await adoptStartPage(context, state, result.finalUrl);
  }
  const page = recordPage(state, entry, result);
  if (page) {
    logPageOutcome(context.deps.logger, page, result);
  }
  reportProgress(context, state, entry.url);
  if (isStartPage) {
    assertStartPageReachable(entry.url, result);
  }
};

export const crawlSite = async (
  context: CrawlContext,
): Promise<CrawlOutcome> => {
  const { request, signal } = context.input;
  const state = createCrawlState(request.url, request.depth);
  for (
    let entry = state.frontier.next();
    entry;
    entry = state.frontier.next()
  ) {
    await visitPage(context, state, entry);
    if (signal.aborted) {
      break;
    }
  }
  return finishCrawl(state, signal);
};

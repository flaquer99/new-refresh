import type { PageResult } from "@refresh/scan-contracts/page-result";
import type { PageAuditResult } from "../audit/page-audit-result.js";
import {
  type CrawlFrontier,
  createCrawlFrontier,
  type FrontierEntry,
} from "../crawl/crawl-frontier.js";
import { isSameOrigin } from "../crawl/normalize-url.js";
import type { RobotsPolicy } from "../crawl/robots-policy.js";
import type { PageProbeMatches } from "../report/aggregate-manual-checks.js";
import type { AxeRun } from "../report/axe-results.js";
import { landsInScope } from "./redirect-scope.js";

type AuditedPage = Extract<PageAuditResult, { kind: "audited" }>;

export type CrawlState = {
  frontier: CrawlFrontier;
  origin: string;
  robots: RobotsPolicy | null;
  pages: PageResult[];
  findings: { axeRuns: AxeRun[]; probeMatches: PageProbeMatches[] };
};

export const createCrawlState = (
  url: string,
  maxDepth: number,
): CrawlState => ({
  frontier: createCrawlFrontier({ startUrl: url, maxDepth }),
  origin: new URL(url).origin,
  robots: null,
  pages: [],
  findings: { axeRuns: [], probeMatches: [] },
});

const robotsSkipped = ({ url, depth }: FrontierEntry): PageResult => ({
  url,
  depth,
  status: "skipped",
  reason: "robots-disallowed",
  httpStatus: null,
});

const queueLinks = (
  state: CrawlState,
  entry: FrontierEntry,
  links: string[],
) => {
  const { frontier, origin, robots } = state;
  const internal = links.filter((link) => isSameOrigin(link, origin));
  for (const candidate of frontier.discover(internal, entry.depth)) {
    if (robots?.isAllowed(candidate.url) ?? true) {
      frontier.enqueue([candidate]);
    } else {
      state.pages.push(robotsSkipped(candidate));
    }
  }
};

const recordAudited = (
  state: CrawlState,
  entry: FrontierEntry,
  { finalUrl, findings, links }: AuditedPage,
): PageResult => {
  const page: PageResult = {
    url: finalUrl,
    depth: entry.depth,
    status: "scanned",
    reason: null,
    httpStatus: null,
  };
  state.pages.push(page);
  state.findings.axeRuns.push(...findings.axeRuns);
  state.findings.probeMatches.push(findings.probeMatches);
  state.frontier.markSeen(finalUrl);
  queueLinks(state, entry, links);
  return page;
};

export const recordPage = (
  state: CrawlState,
  entry: FrontierEntry,
  result: PageAuditResult,
): PageResult | null => {
  if (result.kind !== "audited") {
    const { kind: status, reason, httpStatus } = result;
    const page = { ...entry, status, reason, httpStatus };
    state.pages.push(page);
    return page;
  }
  if (!landsInScope(state, entry, result.finalUrl)) {
    return null;
  }
  return recordAudited(state, entry, result);
};

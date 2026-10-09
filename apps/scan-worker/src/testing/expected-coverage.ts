import type {
  PageReason,
  PageResult,
  PageStatus,
} from "@refresh/scan-contracts/page-result";

type CoverageRow = [
  path: string,
  depth: number,
  status: PageStatus,
  reason: PageReason | null,
  httpStatus: number | null,
];

const PAGE_COVERAGE_ROWS: CoverageRow[] = [
  ["/page-coverage/", 0, "scanned", null, null],
  ["/private/secret.html", 1, "skipped", "robots-disallowed", null],
  ["/page-coverage/about.html", 1, "scanned", null, null],
  ["/page-coverage/brochure.pdf", 1, "skipped", "not-html", 200],
  ["/page-coverage/missing.html", 1, "failed", "http-error", 404],
];

export const expectedPageCoverage = (origin: string): PageResult[] =>
  PAGE_COVERAGE_ROWS.map(([path, depth, status, reason, httpStatus]) => ({
    url: `${origin}${path}`,
    depth,
    status,
    reason,
    httpStatus,
  }));

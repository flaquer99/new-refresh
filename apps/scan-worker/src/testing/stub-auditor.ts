import { vi } from "vitest";
import type { PageAuditResult } from "../audit/page-audit-result.js";
import type { ScanAuditor } from "../scans/scan-runner.js";

export type StubPage =
  | { links?: string[]; finalUrl?: string }
  | PageAuditResult;

export type StubSite = Readonly<Record<string, StubPage>>;

const NOT_FOUND: PageAuditResult = {
  kind: "failed",
  reason: "http-error",
  httpStatus: 404,
};

const toResult = (url: string, page: StubPage | undefined): PageAuditResult => {
  if (!page) {
    return NOT_FOUND;
  }
  if ("kind" in page) {
    return page;
  }
  const finalUrl = page.finalUrl ?? url;
  return {
    kind: "audited",
    finalUrl,
    links: page.links ?? [],
    findings: {
      axeRuns: [],
      probeMatches: { pageUrl: finalUrl, probeIds: [] },
    },
    durationsMs: {},
  };
};

export const stubAuditor = (site: StubSite) => {
  const auditor = {
    audit: vi.fn(({ url }: { url: string }) =>
      Promise.resolve(toResult(url, site[url])),
    ),
    close: vi.fn(() => Promise.resolve()),
  } satisfies ScanAuditor;
  return auditor;
};

export const hangingAuditor = (site: StubSite, hangUrl: string) => {
  const auditor = stubAuditor(site);
  const answer = auditor.audit.getMockImplementation();
  auditor.audit.mockImplementation((input) =>
    input.url === hangUrl || !answer
      ? new Promise<PageAuditResult>(() => undefined)
      : answer(input),
  );
  return auditor;
};

import { describe, expect, it } from "vitest";
import type { PageAuditResult } from "../audit/page-audit-result.js";
import { homeRuns } from "../testing/axe-fixtures.js";
import { runStubScan } from "../testing/run-stub-scan.js";
import type { StubSite } from "../testing/stub-auditor.js";

const START = "https://a.test/";
const MOVED = `${START}moved`;
const ELSEWHERE = "https://b.test/landing";

const urlsOf = (pages: { url: string }[]) => pages.map(({ url }) => url);

const auditedElsewhere = (links: string[]): PageAuditResult => ({
  kind: "audited",
  finalUrl: ELSEWHERE,
  links,
  findings: {
    axeRuns: homeRuns(),
    probeMatches: { pageUrl: ELSEWHERE, probeIds: [] },
  },
  durationsMs: {},
});

const MOVED_ELSEWHERE = {
  [START]: { links: [MOVED] },
  [MOVED]: auditedElsewhere([]),
};

const scanDepth = (depth: number, site: StubSite) =>
  runStubScan({ request: { url: START, depth }, site });

describe("ScanRunner redirects of discovered pages", () => {
  it("leaves a page that redirects to another origin out of the report", async () => {
    // WHEN
    const report = await scanDepth(1, MOVED_ELSEWHERE);

    // THEN
    expect(urlsOf(report.pages)).toEqual([START]);
  });

  it("drops the findings of a page that redirects to another origin", async () => {
    // WHEN
    const report = await scanDepth(1, MOVED_ELSEWHERE);

    // THEN
    expect(report.violations).toEqual([]);
  });

  it("does not follow links found on a page that redirects to another origin", async () => {
    // GIVEN
    const site = {
      [START]: { links: [MOVED] },
      [MOVED]: auditedElsewhere([`${START}via-elsewhere`]),
    };

    // WHEN
    const report = await scanDepth(2, site);

    // THEN
    expect(urlsOf(report.pages)).toEqual([START]);
  });

  it("records a same-origin redirected page under its final URL", async () => {
    // GIVEN
    const site = {
      [START]: { links: [MOVED] },
      [MOVED]: { finalUrl: `${START}new-home` },
    };

    // WHEN
    const report = await scanDepth(1, site);

    // THEN
    expect(urlsOf(report.pages)).toEqual([START, `${START}new-home`]);
  });

  it("records a page once when another link redirects to it", async () => {
    // GIVEN
    const site = {
      [START]: { links: [MOVED] },
      [MOVED]: { finalUrl: START },
    };

    // WHEN
    const report = await scanDepth(1, site);

    // THEN
    expect(urlsOf(report.pages)).toEqual([START]);
  });
});

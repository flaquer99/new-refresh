import { describe, expect, it } from "vitest";
import type { PageAuditResult } from "../audit/page-audit-result.js";
import { buildRule, singleRuleRun } from "../testing/axe-fixtures.js";
import { LOGGED_START, runLoggedScan } from "../testing/logged-scan.js";
import { stubAuditor } from "../testing/stub-auditor.js";

const HOME = `${LOGGED_START}home?ref=mail`;

const auditedWithOneViolation: PageAuditResult = {
  kind: "audited",
  finalUrl: HOME,
  links: [],
  findings: {
    axeRuns: [singleRuleRun({ rule: buildRule() })],
    probeMatches: { pageUrl: HOME, probeIds: [] },
  },
  durationsMs: { desktop: 1200 },
};

const scanStartPage = (result: PageAuditResult) =>
  runLoggedScan(stubAuditor({ [LOGGED_START]: result }));

describe("ScanRunner page logging", () => {
  it("logs page.audited per viewport with path, duration, and counts", async () => {
    // WHEN
    const logger = await scanStartPage(auditedWithOneViolation);

    // THEN
    expect(logger.info).toHaveBeenCalledWith(
      {
        event: "page.audited",
        path: "/home",
        viewport: "desktop",
        durationMs: 1200,
        violations: 1,
        reviewItems: 0,
      },
      "page.audited",
    );
  });

  it("logs page.failed with path, reason, and HTTP status", async () => {
    // WHEN
    const logger = await scanStartPage({
      kind: "failed",
      reason: "http-error",
      httpStatus: 403,
    });

    // THEN
    expect(logger.info).toHaveBeenCalledWith(
      {
        event: "page.failed",
        path: "/",
        reason: "http-error",
        httpStatus: 403,
      },
      "page.failed",
    );
  });

  it("logs page.skipped with path, reason, and HTTP status", async () => {
    // WHEN
    const logger = await scanStartPage({
      kind: "skipped",
      reason: "not-html",
      httpStatus: 200,
    });

    // THEN
    expect(logger.info).toHaveBeenCalledWith(
      { event: "page.skipped", path: "/", reason: "not-html", httpStatus: 200 },
      "page.skipped",
    );
  });
});

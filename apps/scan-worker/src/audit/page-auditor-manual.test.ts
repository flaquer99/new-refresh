import { describe, expect, it } from "vitest";
import { aggregateManualChecks } from "../report/aggregate-manual-checks.js";
import { mapReviewItems } from "../report/map-review-items.js";
import { audited } from "../testing/auditor-harness.js";
import { useAuditor } from "../testing/use-auditor.js";
import type { PageAuditResult } from "./page-audit-result.js";

const manualCriteriaOf = (result: PageAuditResult): string[] =>
  aggregateManualChecks([audited(result).findings.probeMatches]).map(
    (check) => check.criterion.id,
  );

describe("PageAuditor manual checks and review items", () => {
  const auditor = useAuditor();

  it("lists media, form, and authentication manual checks for the media and sign-in page", async () => {
    // WHEN
    const result = await auditor.audit("/media-form/");

    // THEN
    expect(manualCriteriaOf(result)).toEqual(
      expect.arrayContaining([
        "1.2.1",
        "1.2.2",
        "1.2.3",
        "1.2.4",
        "1.2.5",
        "3.3.1",
        "3.3.7",
        "3.3.8",
      ]),
    );
  });

  it("does not list media or authentication checks for a page without them", async () => {
    // WHEN
    const result = await auditor.audit("/clean/");

    // THEN
    const criteria = manualCriteriaOf(result);
    expect(
      criteria.filter((id) => id.startsWith("1.2.") || id === "3.3.8"),
    ).toEqual([]);
  });

  it("records the probe matches under the page's final URL", async () => {
    // WHEN
    const result = audited(await auditor.audit("/media-form/"));

    // THEN
    expect(result.findings.probeMatches.pageUrl).toBe(result.finalUrl);
  });

  it("turns inconclusive axe results on the media page into review items", async () => {
    // WHEN
    const result = audited(await auditor.audit("/media-form/"));

    // THEN
    const ruleIds = mapReviewItems(result.findings.axeRuns).map(
      (item) => item.ruleId,
    );
    expect(ruleIds).toEqual(expect.arrayContaining(["video-caption"]));
  });
});

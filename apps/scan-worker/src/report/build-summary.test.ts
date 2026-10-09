import type { PageResult } from "@refresh/scan-contracts/page-result";
import { describe, expect, it } from "vitest";
import { homeRuns } from "../testing/axe-fixtures.js";
import { aggregateManualChecks } from "./aggregate-manual-checks.js";
import { buildSummary } from "./build-summary.js";
import { mapReviewItems } from "./map-review-items.js";
import { mapViolations } from "./map-violations.js";

const page = (
  url: string,
  status: PageResult["status"],
  reason: PageResult["reason"] = null,
): PageResult => ({ url, depth: 1, status, reason, httpStatus: 200 });

const summarize = () =>
  buildSummary({
    violations: mapViolations(homeRuns()),
    reviewItems: mapReviewItems(homeRuns()),
    manualChecks: aggregateManualChecks([
      { pageUrl: "https://fixtures.test/", probeIds: ["authentication"] },
    ]),
    pages: [
      page("https://fixtures.test/", "scanned"),
      page("https://fixtures.test/a", "scanned"),
      page("https://fixtures.test/doc.pdf", "skipped", "not-html"),
      page("https://fixtures.test/b", "skipped", "not-reached"),
      page("https://fixtures.test/missing", "failed", "http-error"),
    ],
  });

describe("buildSummary", () => {
  it("counts pages by status", () => {
    // WHEN
    const { pagesScanned, pagesSkipped, pagesFailed } = summarize();

    // THEN
    expect({ pagesScanned, pagesSkipped, pagesFailed }).toEqual({
      pagesScanned: 2,
      pagesSkipped: 2,
      pagesFailed: 1,
    });
  });

  it("counts violations by severity", () => {
    // WHEN
    const summary = summarize();

    // THEN
    expect(summary.violationsBySeverity).toEqual({
      critical: 1,
      serious: 2,
      moderate: 0,
      minor: 0,
    });
  });

  it("counts violations by level", () => {
    // WHEN
    const summary = summarize();

    // THEN
    expect(summary.violationsByLevel).toEqual({ A: 1, AA: 2 });
  });

  it("totals violations to the detailed list length", () => {
    // WHEN
    const summary = summarize();

    // THEN
    expect(summary.totalViolations).toBe(3);
  });

  it("counts review items plus manual checks as needing review", () => {
    // GIVEN
    const reviewCount = mapReviewItems(homeRuns()).length;
    const manualCount = aggregateManualChecks([
      { pageUrl: "https://fixtures.test/", probeIds: ["authentication"] },
    ]).length;

    // WHEN
    const summary = summarize();

    // THEN
    expect([reviewCount, manualCount, summary.needsReviewCount]).toEqual([
      1, 13, 14,
    ]);
  });
});

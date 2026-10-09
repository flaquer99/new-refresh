import { ScanReportSchema } from "@refresh/scan-contracts/report";
import { describe, expect, it } from "vitest";
import { buildReportInput } from "../testing/report-input.js";
import { buildReport } from "./build-report.js";

describe("buildReport", () => {
  it("produces a report that satisfies the ScanReport contract", () => {
    // WHEN
    const report = buildReport(buildReportInput());

    // THEN
    expect(ScanReportSchema.parse(report)).toEqual(report);
  });

  it("copies the scan metadata", () => {
    // WHEN
    const { startUrl, origin, depth, startedAt, finishedAt } = buildReport(
      buildReportInput(),
    );

    // THEN
    expect({ startUrl, origin, depth, startedAt, finishedAt }).toEqual(
      buildReportInput().scan,
    );
  });

  it("maps axe findings into violations and review items", () => {
    // WHEN
    const report = buildReport(buildReportInput());

    // THEN
    expect({
      violations: report.violations.map(({ ruleId }) => ruleId),
      reviewItems: report.reviewItems.map(({ ruleId }) => ruleId),
    }).toEqual({
      violations: ["image-alt", "color-contrast", "target-size"],
      reviewItems: ["color-contrast"],
    });
  });

  it("aggregates manual checks from the probe matches", () => {
    // WHEN
    const report = buildReport(buildReportInput());

    // THEN
    expect(
      report.manualChecks
        .map(({ criterion }) => criterion.id)
        .filter((id) => id.startsWith("1.2.")),
    ).toEqual(["1.2.1", "1.2.2", "1.2.3", "1.2.4", "1.2.5"]);
  });

  it("summarizes the detailed lists", () => {
    // WHEN
    const report = buildReport(buildReportInput());

    // THEN
    expect([
      report.summary.totalViolations,
      report.summary.needsReviewCount,
    ]).toEqual([3, 18]);
  });
});

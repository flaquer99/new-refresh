import { describe, expect, it } from "vitest";
import { ScanReportSchema } from "./report.js";
import { buildReport } from "./testing/sample-report.js";

describe("ScanReportSchema", () => {
  it("parses a complete report", () => {
    // GIVEN
    const report = buildReport();

    // WHEN
    const result = ScanReportSchema.safeParse(report);

    // THEN
    expect(result.data).toEqual(report);
  });

  it("rejects an unknown outcome", () => {
    // GIVEN
    const report = { ...buildReport(), outcome: "partial" };

    // WHEN
    const result = ScanReportSchema.safeParse(report);

    // THEN
    expect(result.error?.issues[0]?.path).toEqual(["outcome"]);
  });
});

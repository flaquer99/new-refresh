import { describe, expect, it } from "vitest";
import { buildReportInput } from "../testing/report-input.js";
import { buildReport } from "./build-report.js";

describe("buildReport outcome", () => {
  it.each([
    ["completed", "complete"],
    ["page-limit", "page-limit-reached"],
    ["cancelled", "cancelled"],
    ["deadline", "time-limit-reached"],
  ] as const)(
    "maps the %s stop reason to the %s outcome",
    (reason, outcome) => {
      // WHEN
      const report = buildReport(buildReportInput(reason));

      // THEN
      expect(report.outcome).toBe(outcome);
    },
  );
});

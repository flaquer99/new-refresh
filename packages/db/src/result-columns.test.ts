import { describe, expect, it } from "vitest";
import { REPORT_VERSION, resultColumns } from "./result-columns.js";
import {
  buildCompletedResult,
  buildInterruptedResult,
} from "./testing/sample-result.js";

describe("resultColumns", () => {
  it("copies the summary counts from the report", () => {
    // GIVEN
    const result = buildCompletedResult();

    // WHEN
    const columns = resultColumns(result);

    // THEN
    expect(columns).toMatchObject({
      pagesScanned: 50,
      violationsCritical: 2,
      violationsSerious: 11,
      violationsModerate: 4,
      violationsMinor: 0,
      totalViolations: 17,
      needsReviewCount: 9,
    });
  });

  it("maps the hyphenated outcome to its column value", () => {
    // GIVEN
    const result = buildCompletedResult();

    // WHEN
    const columns = resultColumns(result);

    // THEN
    expect(columns.outcome).toBe("page_limit_reached");
  });

  it("stores the whole report with the current report version", () => {
    // GIVEN
    const result = buildCompletedResult();

    // WHEN
    const columns = resultColumns(result);

    // THEN
    expect(columns).toMatchObject({
      report: result.report,
      reportVersion: REPORT_VERSION,
    });
  });

  it("stores the error and no report columns for a failed result", () => {
    // GIVEN
    const result = buildInterruptedResult();

    // WHEN
    const columns = resultColumns(result);

    // THEN
    expect(columns).toEqual({
      status: "failed",
      finishedAt: new Date(result.finishedAt),
      errorCode: "SCAN_INTERRUPTED",
      errorMessage: result.error?.message,
    });
  });
});

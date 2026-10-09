import { describe, expect, it, vi } from "vitest";
import { toStoredScan, UNREADABLE_REPORT_ERROR } from "./scan-row-mapping.js";
import { buildScanRow } from "./testing/build-scan-row.js";
import { buildSampleReport, SAMPLE_SCAN_ID } from "./testing/sample-result.js";

describe("toStoredScan", () => {
  it("returns the parsed report of a readable row", () => {
    // GIVEN
    const row = buildScanRow();

    // WHEN
    const stored = toStoredScan(row);

    // THEN
    expect(stored.report).toEqual(buildSampleReport());
  });

  it("returns the unreadable-report error for an invalid stored report", () => {
    // GIVEN
    const row = buildScanRow({ report: { outcome: "partial" } });

    // WHEN
    const stored = toStoredScan(row);

    // THEN
    expect(stored).toMatchObject({
      report: null,
      error: UNREADABLE_REPORT_ERROR,
    });
  });

  it("reports an unknown report version as unreadable", () => {
    // GIVEN
    const row = buildScanRow({ reportVersion: 2 });
    const onUnreadableReport = vi.fn();

    // WHEN
    toStoredScan(row, onUnreadableReport);

    // THEN
    expect(onUnreadableReport).toHaveBeenCalledWith(SAMPLE_SCAN_ID);
  });

  it("falls back to INTERNAL_ERROR for an unknown stored error code", () => {
    // GIVEN
    const row = buildScanRow({
      status: "failed",
      report: null,
      errorCode: "TEAPOT",
      errorMessage: "Short and stout.",
    });

    // WHEN
    const stored = toStoredScan(row);

    // THEN
    expect(stored.error).toEqual({
      code: "INTERNAL_ERROR",
      message: "Short and stout.",
    });
  });
});

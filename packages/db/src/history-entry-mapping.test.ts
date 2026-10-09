import { describe, expect, it } from "vitest";
import { toHistoryEntry } from "./scan-row-mapping.js";
import { buildScanRow } from "./testing/build-scan-row.js";

describe("toHistoryEntry", () => {
  it("maps the outcome column back to the contract outcome", () => {
    // GIVEN
    const row = buildScanRow();

    // WHEN
    const entry = toHistoryEntry(row);

    // THEN
    expect(entry.outcome).toBe("page-limit-reached");
  });

  it("groups the severity columns into violation counts", () => {
    // GIVEN
    const row = buildScanRow();

    // WHEN
    const entry = toHistoryEntry(row);

    // THEN
    expect(entry.violationsBySeverity).toEqual({
      critical: 2,
      serious: 11,
      moderate: 4,
      minor: 0,
    });
  });

  it("marks a running scan as not deletable", () => {
    // GIVEN
    const row = buildScanRow({
      status: "running",
      outcome: null,
      report: null,
    });

    // WHEN
    const entry = toHistoryEntry(row);

    // THEN
    expect(entry.deletable).toBe(false);
  });

  it("marks a failed scan as deletable", () => {
    // GIVEN
    const row = buildScanRow({ status: "failed", outcome: null, report: null });

    // WHEN
    const entry = toHistoryEntry(row);

    // THEN
    expect(entry.deletable).toBe(true);
  });
});

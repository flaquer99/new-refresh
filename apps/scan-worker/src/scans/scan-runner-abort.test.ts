import { describe, expect, it } from "vitest";
import {
  HANG_B,
  HANG_C,
  HANG_START,
  startHangingScan,
} from "../testing/hanging-scan.js";

describe("ScanRunner cancellation", () => {
  it("ends with cancelled when the scan is aborted", async () => {
    // GIVEN
    const scan = startHangingScan(HANG_B);
    await scan.inFlight();

    // WHEN
    scan.controller.abort();

    // THEN
    const report = await scan.scanning;
    expect(report.outcome).toBe("cancelled");
  });

  it("records the in-flight page and the queue as not-reached on cancel", async () => {
    // GIVEN
    const scan = startHangingScan(HANG_B);
    await scan.inFlight();

    // WHEN
    scan.controller.abort();

    // THEN
    const { pages } = await scan.scanning;
    expect(pages.map(({ url, reason }) => [url, reason])).toEqual([
      [HANG_START, null],
      [HANG_B, "not-reached"],
      [HANG_C, "not-reached"],
    ]);
  });

  it("closes the auditor so the in-flight page is closed", async () => {
    // GIVEN
    const scan = startHangingScan(HANG_B);
    await scan.inFlight();

    // WHEN
    scan.controller.abort();
    await scan.scanning;

    // THEN
    expect(scan.auditor.close).toHaveBeenCalledTimes(1);
  });
});

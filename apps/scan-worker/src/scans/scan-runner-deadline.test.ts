import { afterEach, describe, expect, it, vi } from "vitest";
import {
  HANG_B,
  HANG_START,
  startHangingScan,
} from "../testing/hanging-scan.js";
import { SCAN_DEADLINE_MS } from "./scan-limits.js";

describe("ScanRunner deadline and early cancel", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a cancelled report when aborted during the start page", async () => {
    // GIVEN
    const scan = startHangingScan(HANG_START);
    await scan.inFlight();

    // WHEN
    scan.controller.abort();

    // THEN
    const report = await scan.scanning;
    expect(report.pages).toEqual([
      {
        url: HANG_START,
        depth: 0,
        status: "skipped",
        reason: "not-reached",
        httpStatus: null,
      },
    ]);
  });

  it("ends with time-limit-reached after the 10-minute deadline", async () => {
    // GIVEN
    vi.useFakeTimers();
    const scan = startHangingScan(HANG_B);
    await scan.inFlight();

    // WHEN
    await vi.advanceTimersByTimeAsync(SCAN_DEADLINE_MS);

    // THEN
    const report = await scan.scanning;
    expect(report.outcome).toBe("time-limit-reached");
  });

  it("clears the deadline timer when the scan finishes", async () => {
    // GIVEN
    vi.useFakeTimers();
    const scan = startHangingScan(HANG_B);
    await scan.inFlight();

    // WHEN
    scan.controller.abort();
    await scan.scanning;

    // THEN
    expect(vi.getTimerCount()).toBe(0);
  });
});

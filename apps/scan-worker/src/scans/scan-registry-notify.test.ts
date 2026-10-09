import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  REGISTRY_SCAN_ID,
  sampleReport,
  startNotifiedScan,
} from "../testing/registry-harness.js";
import { ScanFailedError } from "./scan-failed-error.js";

const NOW = new Date("2026-10-09T10:05:00.000Z");

describe("ScanRegistry result notification", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("notifies the completed result with its report once", async () => {
    // GIVEN
    const { scan, notify } = startNotifiedScan();
    const report = sampleReport();

    // WHEN
    scan.finish(report);
    await vi.advanceTimersByTimeAsync(0);

    // THEN
    expect(notify.mock.calls).toEqual([
      [
        {
          scanId: REGISTRY_SCAN_ID,
          status: "completed",
          report,
          error: null,
          finishedAt: NOW.toISOString(),
        },
      ],
    ]);
  });

  it("notifies a failed result with its error and no report", async () => {
    // GIVEN
    const { scan, notify } = startNotifiedScan();
    const error = new ScanFailedError("SITE_UNREACHABLE", "Unreachable.");

    // WHEN
    scan.fail(error);
    await vi.advanceTimersByTimeAsync(0);

    // THEN
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "failed",
        report: null,
        error: { code: "SITE_UNREACHABLE", message: "Unreachable." },
      }),
    );
  });

  it("notifies a cancelled scan with its partial report", async () => {
    // GIVEN
    const { registry, scanId, scan, notify } = startNotifiedScan();
    registry.cancel(scanId);

    // WHEN
    scan.finish(sampleReport("cancelled"));
    await vi.advanceTimersByTimeAsync(0);

    // THEN
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ status: "cancelled", error: null }),
    );
  });
});

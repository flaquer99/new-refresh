import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startRegistryScan } from "../testing/registry-harness.js";
import { ScanFailedError } from "./scan-failed-error.js";

describe("ScanRegistry failures and unknown scans", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("fails with the runner's scan error code and message", async () => {
    // GIVEN
    const { registry, scanId, scan } = startRegistryScan();

    // WHEN
    scan.fail(
      new ScanFailedError("SITE_UNREACHABLE", "We couldn't reach a.test."),
    );
    await vi.advanceTimersByTimeAsync(0);

    // THEN
    expect(registry.get(scanId)).toMatchObject({
      status: "failed",
      report: null,
      error: { code: "SITE_UNREACHABLE", message: "We couldn't reach a.test." },
    });
  });

  it("hides unexpected runner errors behind INTERNAL_ERROR", async () => {
    // GIVEN
    const { registry, scanId, scan } = startRegistryScan();

    // WHEN
    scan.fail(new Error("Target page, context or browser has been closed"));
    await vi.advanceTimersByTimeAsync(0);

    // THEN
    expect(registry.get(scanId)?.error).toEqual({
      code: "INTERNAL_ERROR",
      message: "Something went wrong while scanning. Try again.",
    });
  });

  it("returns undefined for an unknown scan id", () => {
    // GIVEN
    const { registry } = startRegistryScan();

    // WHEN
    const statuses = [registry.get("unknown"), registry.cancel("unknown")];

    // THEN
    expect(statuses).toEqual([undefined, undefined]);
  });
});

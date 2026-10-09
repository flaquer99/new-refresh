import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  REGISTRY_SCAN_ID,
  sampleReport,
  startRegistryScan,
} from "../testing/registry-harness.js";
import { ABANDON_TIMEOUT_MS, FINISHED_SCAN_TTL_MS } from "./scan-limits.js";

describe("ScanRegistry eviction and abandonment", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(crypto, "randomUUID").mockReturnValue(REGISTRY_SCAN_ID);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("keeps a finished scan until its TTL expires", async () => {
    // GIVEN
    const { registry, scanId, scan } = startRegistryScan();
    scan.finish(sampleReport());

    // WHEN
    await vi.advanceTimersByTimeAsync(FINISHED_SCAN_TTL_MS - 1);

    // THEN
    expect(registry.get(scanId)?.status).toBe("completed");
  });

  it("evicts a finished scan 10 minutes after it finished", async () => {
    // GIVEN
    const { registry, scanId, scan } = startRegistryScan();
    scan.finish(sampleReport());

    // WHEN
    await vi.advanceTimersByTimeAsync(FINISHED_SCAN_TTL_MS);

    // THEN
    expect(registry.get(scanId)).toBeUndefined();
  });

  it("auto-cancels a running scan that is not polled for 60 s", async () => {
    // GIVEN
    const { scan } = startRegistryScan();

    // WHEN
    await vi.advanceTimersByTimeAsync(ABANDON_TIMEOUT_MS);

    // THEN
    expect(scan.input.signal.aborted).toBe(true);
  });

  it("keeps a running scan alive while it is being polled", async () => {
    // GIVEN
    const { registry, scanId, scan } = startRegistryScan();
    await vi.advanceTimersByTimeAsync(ABANDON_TIMEOUT_MS - 1);

    // WHEN
    registry.get(scanId);
    await vi.advanceTimersByTimeAsync(ABANDON_TIMEOUT_MS - 1);

    // THEN
    expect(scan.input.signal.aborted).toBe(false);
  });

  it("stops watching for abandonment once the scan finishes", async () => {
    // GIVEN
    const { scan } = startRegistryScan();
    scan.finish(sampleReport());

    // WHEN
    await vi.advanceTimersByTimeAsync(ABANDON_TIMEOUT_MS);

    // THEN
    expect(scan.input.signal.aborted).toBe(false);
  });
});

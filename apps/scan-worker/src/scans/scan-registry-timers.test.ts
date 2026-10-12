import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  sampleReport,
  startNotifiedScan,
  startRegistryScan,
} from "../testing/registry-harness.js";
import { FINISHED_SCAN_TTL_MS } from "./scan-limits.js";

const UNWATCHED_MS = 5 * 60_000;

describe("ScanRegistry eviction", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("evicts a finished scan right after its result is delivered", async () => {
    // GIVEN
    const { registry, scanId, scan } = startNotifiedScan("delivered");

    // WHEN
    scan.finish(sampleReport());
    await vi.advanceTimersByTimeAsync(0);

    // THEN
    expect(registry.get(scanId)).toBeUndefined();
  });

  it("keeps an undelivered finished scan until its TTL expires", async () => {
    // GIVEN
    const { registry, scanId, scan } = startNotifiedScan("exhausted");
    scan.finish(sampleReport());

    // WHEN
    await vi.advanceTimersByTimeAsync(FINISHED_SCAN_TTL_MS - 1);

    // THEN
    expect(registry.get(scanId)?.status).toBe("completed");
  });

  it("evicts an undelivered finished scan 10 minutes after it finished", async () => {
    // GIVEN
    const { registry, scanId, scan } = startNotifiedScan("exhausted");
    scan.finish(sampleReport());

    // WHEN
    await vi.advanceTimersByTimeAsync(FINISHED_SCAN_TTL_MS);

    // THEN
    expect(registry.get(scanId)).toBeUndefined();
  });

  it("keeps a finished scan until its TTL when no notifier is set", async () => {
    // GIVEN
    const { registry, scanId, scan } = startRegistryScan();
    scan.finish(sampleReport());

    // WHEN
    await vi.advanceTimersByTimeAsync(FINISHED_SCAN_TTL_MS - 1);

    // THEN
    expect(registry.get(scanId)?.status).toBe("completed");
  });

  it("does not cancel a running scan that nobody polls", async () => {
    // GIVEN
    const { registry, scanId, scan } = startRegistryScan();

    // WHEN
    await vi.advanceTimersByTimeAsync(UNWATCHED_MS);

    // THEN
    expect([scan.input.signal.aborted, registry.get(scanId)?.status]).toEqual([
      false,
      "running",
    ]);
  });
});

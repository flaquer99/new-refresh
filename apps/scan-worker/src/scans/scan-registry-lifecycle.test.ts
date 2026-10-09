import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  REGISTRY_SCAN_ID,
  sampleReport,
  startRegistryScan,
} from "../testing/registry-harness.js";

describe("ScanRegistry lifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(crypto, "randomUUID").mockReturnValue(REGISTRY_SCAN_ID);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("starts the runner with the scan id", () => {
    // WHEN
    const { scan } = startRegistryScan();

    // THEN
    expect(scan.input.scanId).toBe(REGISTRY_SCAN_ID);
  });

  it("exposes the latest progress reported by the runner", () => {
    // GIVEN
    const { registry, scanId, scan } = startRegistryScan();
    const progress = {
      pagesScanned: 3,
      pagesDiscovered: 11,
      currentUrl: "https://a.test/about",
    };

    // WHEN
    scan.input.onProgress(progress);

    // THEN
    expect(registry.get(scanId)?.progress).toEqual(progress);
  });

  it("completes with the report once the runner resolves", async () => {
    // GIVEN
    const { registry, scanId, scan } = startRegistryScan();
    const report = sampleReport();

    // WHEN
    scan.finish(report);
    await vi.advanceTimersByTimeAsync(0);

    // THEN
    expect(registry.get(scanId)).toMatchObject({
      status: "completed",
      report,
      error: null,
    });
  });

  it("aborts the runner signal on cancel", () => {
    // GIVEN
    const { registry, scanId, scan } = startRegistryScan();

    // WHEN
    registry.cancel(scanId);

    // THEN
    expect(scan.input.signal.aborted).toBe(true);
  });

  it("becomes cancelled with the partial report after a cancel", async () => {
    // GIVEN
    const { registry, scanId, scan } = startRegistryScan();
    registry.cancel(scanId);

    // WHEN
    scan.finish(sampleReport("cancelled"));
    await vi.advanceTimersByTimeAsync(0);

    // THEN
    expect(registry.get(scanId)?.status).toBe("cancelled");
  });
});

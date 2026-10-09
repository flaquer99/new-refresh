import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createControlledRunner } from "../testing/controlled-runner.js";
import { fakeNotifier } from "../testing/fake-notifier.js";
import { REGISTRY_REQUEST, sampleReport } from "../testing/registry-harness.js";
import { scanIdFor } from "../testing/scan-ids.js";
import { createScanRegistry } from "./scan-registry.js";

const startTwoScans = () => {
  const controlled = createControlledRunner();
  const { notifier, notify } = fakeNotifier();
  const logger = { error: vi.fn(), warn: vi.fn() };
  const registry = createScanRegistry({
    runner: controlled.runner,
    notifier,
    logger,
  });
  registry.create({
    scanId: scanIdFor(1),
    request: REGISTRY_REQUEST,
    clientId: "alice",
  });
  registry.create({
    scanId: scanIdFor(2),
    request: REGISTRY_REQUEST,
    clientId: "bob",
  });
  return { registry, controlled, notify, logger };
};

describe("ScanRegistry shutdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("aborts every running scan on interruptAll", async () => {
    // GIVEN
    const { registry, controlled } = startTwoScans();

    // WHEN
    await registry.interruptAll();

    // THEN
    expect(controlled.scans.map(({ input }) => input.signal.aborted)).toEqual([
      true,
      true,
    ]);
  });

  it("notifies each running scan once as interrupted", async () => {
    // GIVEN
    const { registry, controlled, notify } = startTwoScans();

    // WHEN
    await registry.interruptAll();
    for (const scan of controlled.scans) {
      scan.fail(new Error("Target page, context or browser has been closed"));
    }
    await vi.advanceTimersByTimeAsync(0);

    // THEN
    expect(notify.mock.calls.map(([result]) => result.error?.code)).toEqual([
      "SCAN_INTERRUPTED",
      "SCAN_INTERRUPTED",
    ]);
  });

  it("logs scan.interrupted for each interrupted scan", async () => {
    // GIVEN
    const { registry, logger } = startTwoScans();

    // WHEN
    await registry.interruptAll();

    // THEN
    expect(logger.warn).toHaveBeenCalledWith(
      { event: "scan.interrupted", scanId: scanIdFor(1) },
      "scan.interrupted",
    );
  });

  it("leaves finished scans untouched on interruptAll", async () => {
    // GIVEN
    const { registry, controlled, notify } = startTwoScans();
    controlled.scans[0]?.finish(sampleReport());
    await vi.advanceTimersByTimeAsync(0);
    notify.mockClear();

    // WHEN
    await registry.interruptAll();

    // THEN
    expect(notify.mock.calls.map(([result]) => result.scanId)).toEqual([
      scanIdFor(2),
    ]);
  });
});

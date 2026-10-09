import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createControlledRunner } from "../testing/controlled-runner.js";
import { REGISTRY_REQUEST } from "../testing/registry-harness.js";
import { scanIdFor } from "../testing/scan-ids.js";
import { createScanRegistry } from "./scan-registry.js";

const newRegistry = () =>
  createScanRegistry({ runner: createControlledRunner().runner });

const scanFor = (clientId: string, index: number) => ({
  scanId: scanIdFor(index),
  request: REGISTRY_REQUEST,
  clientId,
});

describe("ScanRegistry limits", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates a running scan with the id chosen by web", () => {
    // GIVEN
    const registry = newRegistry();

    // WHEN
    const status = registry.create(scanFor("alice", 1));

    // THEN
    expect(status).toEqual({
      scanId: scanIdFor(1),
      status: "running",
      progress: { pagesScanned: 0, pagesDiscovered: 0, currentUrl: null },
      report: null,
      error: null,
    });
  });

  it("rejects a second running scan for the same client", () => {
    // GIVEN
    const registry = newRegistry();
    registry.create(scanFor("alice", 1));

    // WHEN
    const creating = () => registry.create(scanFor("alice", 2));

    // THEN
    expect(creating).toThrowError(
      expect.objectContaining({ code: "SCAN_ALREADY_RUNNING" }),
    );
  });

  it("rejects a scan beyond the global cap", () => {
    // GIVEN
    const registry = newRegistry();
    registry.create(scanFor("alice", 1));
    registry.create(scanFor("bob", 2));

    // WHEN
    const creating = () => registry.create(scanFor("carol", 3));

    // THEN
    expect(creating).toThrowError(
      expect.objectContaining({ code: "CAPACITY_REACHED" }),
    );
  });

  it("lets a client start again once its scan has finished", async () => {
    // GIVEN
    const { runner, latest } = createControlledRunner();
    const registry = createScanRegistry({ runner });
    registry.create(scanFor("alice", 1));
    latest().fail(new Error("boom"));
    await vi.runOnlyPendingTimersAsync();

    // WHEN
    const status = registry.create(scanFor("alice", 2));

    // THEN
    expect(status.status).toBe("running");
  });

  it("counts the running scans", () => {
    // GIVEN
    const registry = newRegistry();
    registry.create(scanFor("alice", 1));

    // WHEN
    const active = registry.activeCount();

    // THEN
    expect(active).toBe(1);
  });
});

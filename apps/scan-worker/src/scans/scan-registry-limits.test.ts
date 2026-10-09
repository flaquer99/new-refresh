import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createControlledRunner } from "../testing/controlled-runner.js";
import { createScanRegistry } from "./scan-registry.js";

const SCAN_ID = "8f0c6b8e-3a8e-4d0b-9a57-2f5a1d6f4c11";
const REQUEST = { url: "https://a.test/", depth: 0 };

const newRegistry = () =>
  createScanRegistry({ runner: createControlledRunner().runner });

describe("ScanRegistry limits", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(crypto, "randomUUID").mockReturnValue(SCAN_ID);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("creates a running scan with an id from crypto.randomUUID", () => {
    // GIVEN
    const registry = newRegistry();

    // WHEN
    const status = registry.create({ request: REQUEST, clientId: "alice" });

    // THEN
    expect(status).toEqual({
      scanId: SCAN_ID,
      status: "running",
      progress: { pagesScanned: 0, pagesDiscovered: 0, currentUrl: null },
      report: null,
      error: null,
    });
  });

  it("rejects a second running scan for the same client", () => {
    // GIVEN
    const registry = newRegistry();
    registry.create({ request: REQUEST, clientId: "alice" });

    // WHEN
    const creating = () =>
      registry.create({ request: REQUEST, clientId: "alice" });

    // THEN
    expect(creating).toThrowError(
      expect.objectContaining({ code: "SCAN_ALREADY_RUNNING" }),
    );
  });

  it("rejects a scan beyond the global cap", () => {
    // GIVEN
    const registry = newRegistry();
    registry.create({ request: REQUEST, clientId: "alice" });
    registry.create({ request: REQUEST, clientId: "bob" });

    // WHEN
    const creating = () =>
      registry.create({ request: REQUEST, clientId: "carol" });

    // THEN
    expect(creating).toThrowError(
      expect.objectContaining({ code: "CAPACITY_REACHED" }),
    );
  });

  it("lets a client start again once its scan has finished", async () => {
    // GIVEN
    const { runner, latest } = createControlledRunner();
    const registry = createScanRegistry({ runner });
    registry.create({ request: REQUEST, clientId: "alice" });
    latest().fail(new Error("boom"));
    await vi.runOnlyPendingTimersAsync();

    // WHEN
    const status = registry.create({ request: REQUEST, clientId: "alice" });

    // THEN
    expect(status.status).toBe("running");
  });

  it("counts the running scans", () => {
    // GIVEN
    const registry = newRegistry();
    registry.create({ request: REQUEST, clientId: "alice" });

    // WHEN
    const active = registry.activeCount();

    // THEN
    expect(active).toBe(1);
  });
});

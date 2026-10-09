import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createControlledRunner } from "../testing/controlled-runner.js";
import { sampleReport } from "../testing/registry-harness.js";
import { createScanRegistry } from "./scan-registry.js";

const REQUEST = { url: "https://a.test/", depth: 0 };

const startTwoScans = () => {
  const controlled = createControlledRunner();
  const registry = createScanRegistry({ runner: controlled.runner });
  registry.create({ request: REQUEST, clientId: "alice" });
  registry.create({ request: REQUEST, clientId: "bob" });
  return { registry, controlled };
};

describe("ScanRegistry shutdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("aborts every running scan on cancelAll", () => {
    // GIVEN
    const { registry, controlled } = startTwoScans();

    // WHEN
    registry.cancelAll();

    // THEN
    expect(controlled.scans.map(({ input }) => input.signal.aborted)).toEqual([
      true,
      true,
    ]);
  });

  it("leaves finished scans untouched on cancelAll", async () => {
    // GIVEN
    const { registry, controlled } = startTwoScans();
    const [first] = controlled.scans;
    first?.finish(sampleReport());
    await vi.advanceTimersByTimeAsync(0);

    // WHEN
    registry.cancelAll();

    // THEN
    expect(first?.input.signal.aborted).toBe(false);
  });
});

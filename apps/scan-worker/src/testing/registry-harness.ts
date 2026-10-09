import { vi } from "vitest";
import type { NotifyOutcome } from "../callback/result-notifier.js";
import type { ScanStopReason } from "../report/build-report.js";
import { buildReport } from "../report/build-report.js";
import { createScanRegistry } from "../scans/scan-registry.js";
import { createControlledRunner } from "./controlled-runner.js";
import { fakeNotifier } from "./fake-notifier.js";
import { buildReportInput } from "./report-input.js";

export const REGISTRY_SCAN_ID = "8f0c6b8e-3a8e-4d0b-9a57-2f5a1d6f4c11";
export const REGISTRY_REQUEST = { url: "https://a.test/", depth: 0 };

export const sampleReport = (stopReason: ScanStopReason = "completed") =>
  buildReport(buildReportInput(stopReason));

export const startRegistryScan = () => {
  const controlled = createControlledRunner();
  const registry = createScanRegistry({ runner: controlled.runner });
  const { scanId } = registry.create({
    scanId: REGISTRY_SCAN_ID,
    request: REGISTRY_REQUEST,
    clientId: "alice",
  });
  return { registry, scanId, scan: controlled.latest() };
};

export const startLoggedRegistryScan = () => {
  const logger = { error: vi.fn(), warn: vi.fn() };
  const controlled = createControlledRunner();
  const registry = createScanRegistry({ runner: controlled.runner, logger });
  registry.create({
    scanId: REGISTRY_SCAN_ID,
    request: REGISTRY_REQUEST,
    clientId: "alice",
  });
  return { logger, scan: controlled.latest() };
};

export const startNotifiedScan = (outcome: NotifyOutcome = "delivered") => {
  const controlled = createControlledRunner();
  const { notifier, notify } = fakeNotifier(outcome);
  const registry = createScanRegistry({ runner: controlled.runner, notifier });
  const { scanId } = registry.create({
    scanId: REGISTRY_SCAN_ID,
    request: REGISTRY_REQUEST,
    clientId: "alice",
  });
  return { registry, scanId, scan: controlled.latest(), notify };
};

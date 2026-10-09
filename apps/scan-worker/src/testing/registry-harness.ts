import type { ScanStopReason } from "../report/build-report.js";
import { buildReport } from "../report/build-report.js";
import { createScanRegistry } from "../scans/scan-registry.js";
import { createControlledRunner } from "./controlled-runner.js";
import { buildReportInput } from "./report-input.js";

export const REGISTRY_SCAN_ID = "8f0c6b8e-3a8e-4d0b-9a57-2f5a1d6f4c11";
const REQUEST = { url: "https://a.test/", depth: 0 };

export const sampleReport = (stopReason: ScanStopReason = "completed") =>
  buildReport(buildReportInput(stopReason));

export const startRegistryScan = () => {
  const controlled = createControlledRunner();
  const registry = createScanRegistry({ runner: controlled.runner });
  const { scanId } = registry.create({ request: REQUEST, clientId: "alice" });
  return { registry, scanId, scan: controlled.latest() };
};

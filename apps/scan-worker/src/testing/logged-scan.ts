import { vi } from "vitest";
import { createScanRunner, type ScanAuditor } from "../scans/scan-runner.js";
import { createScanRecorder } from "./scan-logger.js";
import { STUB_SCAN_ID, stubRunnerDeps } from "./stub-runner-deps.js";

export const LOGGED_START = "https://a.test/";

export const runLoggedScan = async (auditor: ScanAuditor) => {
  const logger = createScanRecorder();
  const runScan = createScanRunner({ ...stubRunnerDeps(auditor), logger });
  await Promise.allSettled([
    runScan({
      scanId: STUB_SCAN_ID,
      request: { url: LOGGED_START, depth: 0 },
      signal: new AbortController().signal,
      onProgress: vi.fn(),
    }),
  ]);
  return logger;
};

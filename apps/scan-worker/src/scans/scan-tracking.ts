import type { ScanRequest } from "@refresh/scan-contracts/scan-request";
import { logScanFailure, type ScanRegistryLogger } from "./scan-failure-log.js";
import type { ScanLimits } from "./scan-limits.js";
import { completeRecord, failRecord, type ScanRecord } from "./scan-record.js";
import type { ScanRunner } from "./scan-runner.js";
import type { ScanTimers } from "./scan-timers.js";

export type ScanRegistryOptions = {
  runner: ScanRunner;
  logger?: ScanRegistryLogger;
};

export type TrackedScan = { record: ScanRecord; timers: ScanTimers };

export type RegistryState = ScanRegistryOptions & {
  limits: ScanLimits;
  scans: Map<string, TrackedScan>;
};

export const runTracked = async (
  state: RegistryState,
  { record, timers }: TrackedScan,
  request: ScanRequest,
): Promise<void> => {
  try {
    const report = await state.runner({
      scanId: record.scanId,
      request,
      signal: record.controller.signal,
      onProgress: (progress) => {
        record.progress = progress;
      },
    });
    completeRecord(record, report);
  } catch (error) {
    failRecord(record, error);
    logScanFailure(state.logger, record, error);
  } finally {
    state.limits.release(record.clientId);
    timers.finish(() => state.scans.delete(record.scanId));
  }
};

export const cancelRunning = (state: RegistryState) => {
  for (const { record } of state.scans.values()) {
    if (record.status === "running") {
      record.controller.abort();
    }
  }
};

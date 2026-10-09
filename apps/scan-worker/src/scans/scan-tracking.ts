import type { ScanRequest } from "@refresh/scan-contracts/scan-request";
import type { ResultNotifier } from "../callback/result-notifier.js";
import {
  logScanFailure,
  logScanInterrupted,
  type ScanRegistryLogger,
} from "./scan-failure-log.js";
import type { ScanLimits } from "./scan-limits.js";
import {
  completeRecord,
  failRecord,
  interruptRecord,
  type ScanRecord,
} from "./scan-record.js";
import { toResult } from "./scan-result-of.js";
import type { ScanRunner } from "./scan-runner.js";
import type { ScanTimers } from "./scan-timers.js";

export type ScanRegistryOptions = {
  runner: ScanRunner;
  logger?: ScanRegistryLogger;
  notifier?: ResultNotifier;
};

export type TrackedScan = { record: ScanRecord; timers: ScanTimers };

export type RegistryState = ScanRegistryOptions & {
  limits: ScanLimits;
  scans: Map<string, TrackedScan>;
};

const runToEnd = async (
  state: RegistryState,
  record: ScanRecord,
  request: ScanRequest,
): Promise<boolean> => {
  try {
    const report = await state.runner({
      scanId: record.scanId,
      request,
      signal: record.controller.signal,
      onProgress: (progress) => {
        record.progress = progress;
      },
    });
    return completeRecord(record, report);
  } catch (error) {
    const failed = failRecord(record, error);
    if (failed) {
      logScanFailure(state.logger, record, error);
    }
    return failed;
  }
};

const reportResult = async (
  state: RegistryState,
  { record, timers }: TrackedScan,
): Promise<void> => {
  const outcome = state.notifier
    ? await state.notifier.notify(toResult(record, new Date()))
    : "exhausted";
  if (outcome === "delivered") {
    state.scans.delete(record.scanId);
    return;
  }
  timers.finish(() => state.scans.delete(record.scanId));
};

export const runTracked = async (
  state: RegistryState,
  tracked: TrackedScan,
  request: ScanRequest,
): Promise<void> => {
  const settled = await runToEnd(state, tracked.record, request);
  state.limits.release(tracked.record.clientId);
  if (settled) {
    await reportResult(state, tracked);
  }
};

export const interruptRunning = async (state: RegistryState): Promise<void> => {
  const interrupted = [...state.scans.values()].filter(({ record }) =>
    interruptRecord(record),
  );
  for (const { record } of interrupted) {
    record.controller.abort();
    logScanInterrupted(state.logger, record);
  }
  await Promise.all(interrupted.map((tracked) => reportResult(state, tracked)));
};

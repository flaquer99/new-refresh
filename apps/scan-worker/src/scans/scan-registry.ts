import type { ScanRequest } from "@refresh/scan-contracts/scan-request";
import type { ScanStatus } from "@refresh/scan-contracts/scan-status";
import { createScanLimits } from "./scan-limits.js";
import { newScanRecord, toStatus } from "./scan-record.js";
import { createScanTimers } from "./scan-timers.js";
import {
  cancelRunning,
  type RegistryState,
  runTracked,
  type ScanRegistryOptions,
  type TrackedScan,
} from "./scan-tracking.js";

export type CreateScanInput = { request: ScanRequest; clientId: string };

export type ScanRegistry = {
  create: (input: CreateScanInput) => ScanStatus;
  get: (scanId: string) => ScanStatus | undefined;
  cancel: (scanId: string) => ScanStatus | undefined;
  cancelAll: () => void;
  activeCount: () => number;
};

const createTracked = (
  state: RegistryState,
  { request, clientId }: CreateScanInput,
): ScanStatus => {
  state.limits.reserve(clientId);
  const record = newScanRecord(crypto.randomUUID(), clientId);
  const timers = createScanTimers(() => record.controller.abort());
  const tracked = { record, timers };
  state.scans.set(record.scanId, tracked);
  void runTracked(state, tracked, request);
  return toStatus(record);
};

const pollTracked = (tracked: TrackedScan | undefined) => {
  if (tracked?.record.status === "running") {
    tracked.timers.touch();
  }
  return tracked && toStatus(tracked.record);
};

export const createScanRegistry = (
  options: ScanRegistryOptions,
): ScanRegistry => {
  const state: RegistryState = {
    ...options,
    limits: createScanLimits(),
    scans: new Map(),
  };
  return {
    create: (input) => createTracked(state, input),
    get: (scanId) => pollTracked(state.scans.get(scanId)),
    cancel: (scanId) => {
      const tracked = state.scans.get(scanId);
      tracked?.record.controller.abort();
      return tracked && toStatus(tracked.record);
    },
    cancelAll: () => cancelRunning(state),
    activeCount: state.limits.activeCount,
  };
};

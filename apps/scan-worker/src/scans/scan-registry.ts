import type { ScanRequest } from "@refresh/scan-contracts/scan-request";
import type { ScanStatus } from "@refresh/scan-contracts/scan-status";
import { ScanIdTakenError } from "./scan-id-taken-error.js";
import { createScanLimits } from "./scan-limits.js";
import { newScanRecord, toStatus } from "./scan-record.js";
import { createScanTimers } from "./scan-timers.js";
import {
  interruptRunning,
  type RegistryState,
  runTracked,
  type ScanRegistryOptions,
} from "./scan-tracking.js";

export type CreateScanInput = {
  scanId: string;
  request: ScanRequest;
  clientId: string;
};

export type ScanRegistry = {
  create: (input: CreateScanInput) => ScanStatus;
  get: (scanId: string) => ScanStatus | undefined;
  cancel: (scanId: string) => ScanStatus | undefined;
  interruptAll: () => Promise<void>;
  activeCount: () => number;
};

const createTracked = (
  state: RegistryState,
  { scanId, request, clientId }: CreateScanInput,
): ScanStatus => {
  if (state.scans.has(scanId)) {
    throw new ScanIdTakenError();
  }
  state.limits.reserve(clientId);
  const record = newScanRecord(scanId, clientId);
  const tracked = { record, timers: createScanTimers() };
  state.scans.set(scanId, tracked);
  void runTracked(state, tracked, request);
  return toStatus(record);
};

export const createScanRegistry = (
  options: ScanRegistryOptions,
): ScanRegistry => {
  const state: RegistryState = {
    ...options,
    limits: createScanLimits(),
    scans: new Map(),
  };
  const statusOf = (scanId: string) => {
    const tracked = state.scans.get(scanId);
    return tracked && toStatus(tracked.record);
  };
  return {
    create: (input) => createTracked(state, input),
    get: statusOf,
    cancel: (scanId) => {
      state.scans.get(scanId)?.record.controller.abort();
      return statusOf(scanId);
    },
    interruptAll: () => interruptRunning(state),
    activeCount: state.limits.activeCount,
  };
};

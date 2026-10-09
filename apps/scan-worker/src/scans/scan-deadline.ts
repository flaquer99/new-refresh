import { SCAN_DEADLINE_MS } from "./scan-limits.js";

export class ScanDeadlineError extends Error {
  constructor() {
    super("The scan reached its time limit.");
    this.name = "ScanDeadlineError";
  }
}

export type ScanDeadline = { signal: AbortSignal; clear: () => void };

export const startScanDeadline = (
  cancelSignal: AbortSignal,
  ms: number = SCAN_DEADLINE_MS,
): ScanDeadline => {
  const deadline = new AbortController();
  const timer = setTimeout(() => deadline.abort(new ScanDeadlineError()), ms);
  return {
    signal: AbortSignal.any([cancelSignal, deadline.signal]),
    clear: () => clearTimeout(timer),
  };
};

export const isDeadlineAbort = (signal: AbortSignal): boolean =>
  signal.reason instanceof ScanDeadlineError;

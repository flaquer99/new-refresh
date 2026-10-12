import { sleep } from "../scans/abortable.js";

export const RETRY_DELAYS_MS = [1000, 2000, 4000] as const;

export const ATTEMPT_TIMEOUT_MS = 5000;

export const waitForRetry = async (
  ms: number,
  signal: AbortSignal,
): Promise<boolean> => {
  await sleep(ms, signal);
  return !signal.aborted;
};

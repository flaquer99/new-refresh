import { ABANDON_TIMEOUT_MS, FINISHED_SCAN_TTL_MS } from "./scan-limits.js";

export type ScanTimers = {
  touch: () => void;
  finish: (evict: () => void) => void;
};

const later = (ms: number, action: () => void): NodeJS.Timeout =>
  setTimeout(action, ms).unref();

export const createScanTimers = (abandon: () => void): ScanTimers => {
  let abandonTimer = later(ABANDON_TIMEOUT_MS, abandon);
  return {
    touch: () => {
      clearTimeout(abandonTimer);
      abandonTimer = later(ABANDON_TIMEOUT_MS, abandon);
    },
    finish: (evict) => {
      clearTimeout(abandonTimer);
      later(FINISHED_SCAN_TTL_MS, evict);
    },
  };
};

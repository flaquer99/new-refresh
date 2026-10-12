import { FINISHED_SCAN_TTL_MS } from "./scan-limits.js";

export type ScanTimers = {
  finish: (evict: () => void) => void;
};

export const createScanTimers = (): ScanTimers => ({
  finish: (evict) => {
    setTimeout(evict, FINISHED_SCAN_TTL_MS).unref();
  },
});

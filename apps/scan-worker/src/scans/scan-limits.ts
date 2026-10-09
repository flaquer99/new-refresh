import { CapacityError, ScanConflictError } from "./scan-limit-errors.js";

export const PAGE_DELAY_MS = 500;
export const SCAN_DEADLINE_MS = 600_000;
export const MAX_ACTIVE_SCANS = 2;
export const MAX_ACTIVE_SCANS_PER_CLIENT = 1;
export const FINISHED_SCAN_TTL_MS = 600_000;
export const ABANDON_TIMEOUT_MS = 60_000;

export type ScanLimits = {
  reserve: (clientId: string) => void;
  release: (clientId: string) => void;
  activeCount: () => number;
};

export const createScanLimits = (): ScanLimits => {
  const perClient = new Map<string, number>();
  let active = 0;
  return {
    reserve: (clientId) => {
      const running = perClient.get(clientId) ?? 0;
      if (running >= MAX_ACTIVE_SCANS_PER_CLIENT) {
        throw new ScanConflictError();
      }
      if (active >= MAX_ACTIVE_SCANS) {
        throw new CapacityError();
      }
      perClient.set(clientId, running + 1);
      active += 1;
    },
    release: (clientId) => {
      const remaining = (perClient.get(clientId) ?? 1) - 1;
      if (remaining > 0) {
        perClient.set(clientId, remaining);
      } else {
        perClient.delete(clientId);
      }
      active = Math.max(active - 1, 0);
    },
    activeCount: () => active,
  };
};

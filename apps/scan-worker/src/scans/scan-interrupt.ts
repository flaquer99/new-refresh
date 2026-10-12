import { logScanInterrupted } from "./scan-failure-log.js";
import { interruptRecord } from "./scan-record.js";
import { type RegistryState, trackDelivery } from "./scan-tracking.js";

export const interruptRunning = async (state: RegistryState): Promise<void> => {
  const interrupted = [...state.scans.values()].filter(({ record }) =>
    interruptRecord(record),
  );
  for (const tracked of interrupted) {
    tracked.record.controller.abort();
    logScanInterrupted(state.logger, tracked.record);
    void trackDelivery(state, tracked);
  }
  await Promise.all(state.deliveries);
};

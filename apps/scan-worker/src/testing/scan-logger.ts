import { vi } from "vitest";
import type { ScanLogger } from "../scans/scan-logger.js";

export const createScanRecorder = () => {
  const recorder = {
    info: vi.fn(),
    warn: vi.fn(),
    child: vi.fn((): ScanLogger => recorder),
  };
  return recorder;
};

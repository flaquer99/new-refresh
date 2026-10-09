import type { ScanReport } from "@refresh/scan-contracts/report";
import { vi } from "vitest";
import type { RunScanInput, ScanRunner } from "../scans/scan-runner.js";

export type ControlledScan = {
  input: RunScanInput;
  finish: (report: ScanReport) => void;
  fail: (error: unknown) => void;
};

export const createControlledRunner = () => {
  const scans: ControlledScan[] = [];
  const runner: ScanRunner = vi.fn(
    (input: RunScanInput) =>
      new Promise<ScanReport>((resolve, reject) => {
        scans.push({ input, finish: resolve, fail: reject });
      }),
  );
  const latest = (): ControlledScan => {
    const scan = scans.at(-1);
    if (!scan) {
      throw new Error("No scan has been started");
    }
    return scan;
  };
  return { runner, scans, latest };
};

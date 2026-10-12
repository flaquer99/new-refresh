import type { ScanResult } from "@refresh/scan-contracts/scan-result";
import type { ScanRecord } from "./scan-record.js";

export const toResult = (record: ScanRecord, finishedAt: Date): ScanResult => {
  if (record.status === "running") {
    throw new Error(
      `Scan ${record.scanId} is still running and has no result.`,
    );
  }
  const failed = record.status === "failed";
  return {
    scanId: record.scanId,
    status: record.status,
    report: failed ? null : record.report,
    error: failed ? record.error : null,
    finishedAt: finishedAt.toISOString(),
  };
};

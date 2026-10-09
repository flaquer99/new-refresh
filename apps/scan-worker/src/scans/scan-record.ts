import type { ScanError } from "@refresh/scan-contracts/errors";
import type { ScanReport } from "@refresh/scan-contracts/report";
import type {
  ScanProgress,
  ScanStatus,
  ScanStatusValue,
} from "@refresh/scan-contracts/scan-status";
import { ScanFailedError } from "./scan-failed-error.js";

export type ScanRecord = {
  scanId: string;
  clientId: string;
  status: ScanStatusValue;
  progress: ScanProgress;
  report: ScanReport | null;
  error: ScanError | null;
  controller: AbortController;
};

const INTERNAL_ERROR: ScanError = {
  code: "INTERNAL_ERROR",
  message: "Something went wrong while scanning. Try again.",
};

export const newScanRecord = (
  scanId: string,
  clientId: string,
): ScanRecord => ({
  scanId,
  clientId,
  status: "running",
  progress: { pagesScanned: 0, pagesDiscovered: 0, currentUrl: null },
  report: null,
  error: null,
  controller: new AbortController(),
});

export const toStatus = (record: ScanRecord): ScanStatus => ({
  scanId: record.scanId,
  status: record.status,
  progress: { ...record.progress },
  report: record.report,
  error: record.error,
});

export const completeRecord = (record: ScanRecord, report: ScanReport) => {
  record.status = report.outcome === "cancelled" ? "cancelled" : "completed";
  record.report = report;
  record.progress = { ...record.progress, currentUrl: null };
};

export const failRecord = (record: ScanRecord, error: unknown) => {
  record.status = "failed";
  record.progress = { ...record.progress, currentUrl: null };
  record.error =
    error instanceof ScanFailedError
      ? { code: error.code, message: error.message }
      : INTERNAL_ERROR;
};

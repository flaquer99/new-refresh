import type { ScanErrorCode } from "@refresh/scan-contracts/errors";
import { redactError } from "./redact-urls.js";
import type { ScanRecord } from "./scan-record.js";

const FALLBACK_CODE: ScanErrorCode = "INTERNAL_ERROR";

export type ScanFailedLog = {
  event: "scan.failed";
  scanId: string;
  code: ScanErrorCode;
  err: unknown;
};

export type ScanInterruptedLog = {
  event: "scan.interrupted";
  scanId: string;
};

export type ScanRegistryLogger = {
  error: (details: ScanFailedLog, message: string) => void;
  warn: (details: ScanInterruptedLog, message: string) => void;
};

export const logScanInterrupted = (
  logger: ScanRegistryLogger | undefined,
  record: ScanRecord,
) => {
  logger?.warn(
    { event: "scan.interrupted", scanId: record.scanId },
    "scan.interrupted",
  );
};

export const logScanFailure = (
  logger: ScanRegistryLogger | undefined,
  record: ScanRecord,
  err: unknown,
) => {
  const code = record.error?.code ?? FALLBACK_CODE;
  const details: ScanFailedLog = {
    event: "scan.failed",
    scanId: record.scanId,
    code,
    err: redactError(err),
  };
  logger?.error(details, "scan.failed");
};

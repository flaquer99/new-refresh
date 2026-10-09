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

export type ScanRegistryLogger = {
  error: (details: ScanFailedLog, message: string) => void;
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

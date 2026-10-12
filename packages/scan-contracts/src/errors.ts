import { z } from "zod";

export const SCAN_ERROR_CODES = [
  "INVALID_REQUEST",
  "URL_NOT_ALLOWED",
  "SCAN_ALREADY_RUNNING",
  "CAPACITY_REACHED",
  "SCAN_NOT_FOUND",
  "UNAUTHORIZED",
  "WORKER_UNAVAILABLE",
  "SITE_UNREACHABLE",
  "START_URL_BLOCKED",
  "SCAN_INTERRUPTED",
  "SCAN_ID_TAKEN",
  "SCAN_STILL_RUNNING",
  "INTERNAL_ERROR",
] as const;

export const ScanErrorCodeSchema = z.enum(SCAN_ERROR_CODES);

export type ScanErrorCode = z.infer<typeof ScanErrorCodeSchema>;

export const ScanErrorSchema = z.object({
  code: ScanErrorCodeSchema,
  message: z.string(),
});

export type ScanError = z.infer<typeof ScanErrorSchema>;

export const ErrorEnvelopeSchema = z.object({
  error: ScanErrorSchema,
});

export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;

export type HttpScanErrorCode = Exclude<
  ScanErrorCode,
  "SITE_UNREACHABLE" | "START_URL_BLOCKED" | "SCAN_INTERRUPTED"
>;

export const SCAN_ERROR_HTTP_STATUS = {
  INVALID_REQUEST: 400,
  UNAUTHORIZED: 401,
  SCAN_NOT_FOUND: 404,
  SCAN_ALREADY_RUNNING: 409,
  SCAN_ID_TAKEN: 409,
  SCAN_STILL_RUNNING: 409,
  URL_NOT_ALLOWED: 422,
  INTERNAL_ERROR: 500,
  WORKER_UNAVAILABLE: 502,
  CAPACITY_REACHED: 503,
} as const satisfies Record<HttpScanErrorCode, number>;

export const SCAN_INTERRUPTED_MESSAGE =
  "Interrupted: the checker restarted. Run the scan again.";

export const SCAN_STILL_RUNNING_MESSAGE =
  "This scan is still running. Cancel it and wait for it to finish before deleting it.";

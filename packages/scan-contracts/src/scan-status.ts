import { z } from "zod";
import { ScanErrorSchema } from "./errors.js";
import { ScanReportSchema } from "./report.js";

export const SCAN_STATUS_VALUES = [
  "running",
  "completed",
  "cancelled",
  "failed",
] as const;

export const ScanStatusValueSchema = z.enum(SCAN_STATUS_VALUES);
export type ScanStatusValue = z.infer<typeof ScanStatusValueSchema>;

export const ScanProgressSchema = z.object({
  pagesScanned: z.number().int().nonnegative(),
  pagesDiscovered: z.number().int().nonnegative(),
  currentUrl: z.string().nullable(),
});
export type ScanProgress = z.infer<typeof ScanProgressSchema>;

export const ScanStatusSchema = z.object({
  scanId: z.string(),
  status: ScanStatusValueSchema,
  progress: ScanProgressSchema,
  report: ScanReportSchema.nullable(),
  error: ScanErrorSchema.nullable(),
});
export type ScanStatus = z.infer<typeof ScanStatusSchema>;

export const isTerminalStatus = (status: ScanStatusValue): boolean =>
  status !== "running";

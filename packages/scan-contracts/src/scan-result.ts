import { z } from "zod";
import { ScanErrorSchema } from "./errors.js";
import { ScanReportSchema } from "./report.js";

export const FINAL_STATUS_VALUES = [
  "completed",
  "cancelled",
  "failed",
] as const;

export const FinalStatusSchema = z.enum(FINAL_STATUS_VALUES);

export type FinalStatus = z.infer<typeof FinalStatusSchema>;

export const INCONSISTENT_RESULT_MESSAGE =
  "A failed result needs an error and no report; any other result needs a report and no error.";

const ScanResultShape = z.object({
  scanId: z.uuid(),
  status: FinalStatusSchema,
  report: ScanReportSchema.nullable(),
  error: ScanErrorSchema.nullable(),
  finishedAt: z.iso.datetime(),
});

type ScanResultShapeValue = z.infer<typeof ScanResultShape>;

const isConsistent = ({ status, report, error }: ScanResultShapeValue) => {
  if (status === "failed") {
    return error !== null && report === null;
  }
  return report !== null && error === null;
};

export const ScanResultSchema = ScanResultShape.refine(isConsistent, {
  message: INCONSISTENT_RESULT_MESSAGE,
});

export type ScanResult = z.infer<typeof ScanResultSchema>;

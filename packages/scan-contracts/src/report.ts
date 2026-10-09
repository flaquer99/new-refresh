import { z } from "zod";
import {
  ManualCheckSchema,
  ReviewItemSchema,
  ViolationSchema,
} from "./findings.js";
import { PageResultSchema } from "./page-result.js";
import { ScanDepthSchema } from "./scan-request.js";

export const REPORT_OUTCOMES = [
  "complete",
  "cancelled",
  "page-limit-reached",
  "time-limit-reached",
] as const;

export const ReportOutcomeSchema = z.enum(REPORT_OUTCOMES);
export type ReportOutcome = z.infer<typeof ReportOutcomeSchema>;

const countSchema = z.number().int().nonnegative();

export const ReportSummarySchema = z.object({
  pagesScanned: countSchema,
  pagesSkipped: countSchema,
  pagesFailed: countSchema,
  totalViolations: countSchema,
  violationsBySeverity: z.object({
    critical: countSchema,
    serious: countSchema,
    moderate: countSchema,
    minor: countSchema,
  }),
  violationsByLevel: z.object({ A: countSchema, AA: countSchema }),
  needsReviewCount: countSchema,
});
export type ReportSummary = z.infer<typeof ReportSummarySchema>;

export const ScanReportSchema = z.object({
  startUrl: z.string(),
  origin: z.string(),
  depth: ScanDepthSchema,
  outcome: ReportOutcomeSchema,
  startedAt: z.iso.datetime(),
  finishedAt: z.iso.datetime(),
  summary: ReportSummarySchema,
  violations: z.array(ViolationSchema),
  reviewItems: z.array(ReviewItemSchema),
  manualChecks: z.array(ManualCheckSchema),
  pages: z.array(PageResultSchema),
});
export type ScanReport = z.infer<typeof ScanReportSchema>;

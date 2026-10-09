import {
  SCAN_INTERRUPTED_MESSAGE,
  type ScanError,
} from "@refresh/scan-contracts/errors";
import type { ScanReport } from "@refresh/scan-contracts/report";
import type { ScanResult } from "@refresh/scan-contracts/scan-result";
import type { Prisma } from "./generated/prisma/client.js";
import { toOutcomeColumn } from "./outcome-mapping.js";

export const REPORT_VERSION = 1;

type ScanColumns = Prisma.ScanUpdateManyMutationInput;

const reportColumns = (report: ScanReport): ScanColumns => ({
  outcome: toOutcomeColumn(report.outcome),
  origin: report.origin,
  pagesScanned: report.summary.pagesScanned,
  violationsCritical: report.summary.violationsBySeverity.critical,
  violationsSerious: report.summary.violationsBySeverity.serious,
  violationsModerate: report.summary.violationsBySeverity.moderate,
  violationsMinor: report.summary.violationsBySeverity.minor,
  totalViolations: report.summary.totalViolations,
  needsReviewCount: report.summary.needsReviewCount,
  report,
  reportVersion: REPORT_VERSION,
});

const errorColumns = (error: ScanError): ScanColumns => ({
  errorCode: error.code,
  errorMessage: error.message,
});

export const resultColumns = (result: ScanResult): ScanColumns => ({
  status: result.status,
  finishedAt: new Date(result.finishedAt),
  ...(result.report === null ? {} : reportColumns(result.report)),
  ...(result.error === null ? {} : errorColumns(result.error)),
});

export const interruptedColumns = (finishedAt: Date): ScanColumns => ({
  status: "failed",
  finishedAt,
  errorCode: "SCAN_INTERRUPTED",
  errorMessage: SCAN_INTERRUPTED_MESSAGE,
});

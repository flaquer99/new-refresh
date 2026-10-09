import {
  type ScanError,
  ScanErrorCodeSchema,
} from "@refresh/scan-contracts/errors";
import { ScanReportSchema } from "@refresh/scan-contracts/report";
import type { Scan } from "./generated/prisma/client.js";
import { fromOutcomeColumn } from "./outcome-mapping.js";
import { REPORT_VERSION } from "./result-columns.js";
import type { ScanHistoryEntry, StoredScan } from "./scan-store-types.js";

export const UNREADABLE_REPORT_ERROR: ScanError = {
  code: "INTERNAL_ERROR",
  message: "This report can no longer be displayed.",
};

export type ScanSummaryRow = Omit<Scan, "report">;

const storedError = (row: ScanSummaryRow): ScanError | null => {
  if (row.errorCode === null) {
    return null;
  }
  const code = ScanErrorCodeSchema.safeParse(row.errorCode);
  return {
    code: code.success ? code.data : "INTERNAL_ERROR",
    message: row.errorMessage ?? "",
  };
};

const readReport = (row: Scan) => {
  if (row.reportVersion !== REPORT_VERSION) {
    return null;
  }
  const parsed = ScanReportSchema.safeParse(row.report);
  return parsed.success ? parsed.data : null;
};

export const toStoredScan = (
  row: Scan,
  onUnreadableReport?: (scanId: string) => void,
): StoredScan => {
  const base = {
    scanId: row.id,
    startUrl: row.startUrl,
    depth: row.depth,
    status: row.status,
    startedAt: row.startedAt.toISOString(),
    finishedAt: row.finishedAt?.toISOString() ?? null,
  };
  if (row.report === null) {
    return { ...base, report: null, error: storedError(row) };
  }
  const report = readReport(row);
  if (report === null) {
    onUnreadableReport?.(row.id);
    return { ...base, report: null, error: UNREADABLE_REPORT_ERROR };
  }
  return { ...base, report, error: storedError(row) };
};

export const toHistoryEntry = (row: ScanSummaryRow): ScanHistoryEntry => ({
  scanId: row.id,
  startUrl: row.startUrl,
  status: row.status,
  outcome: fromOutcomeColumn(row.outcome),
  depth: row.depth,
  startedAt: row.startedAt.toISOString(),
  pagesScanned: row.pagesScanned,
  violationsBySeverity: {
    critical: row.violationsCritical,
    serious: row.violationsSerious,
    moderate: row.violationsModerate,
    minor: row.violationsMinor,
  },
  error: storedError(row),
  deletable: row.status !== "running",
});

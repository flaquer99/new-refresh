import type { ScanError } from "@refresh/scan-contracts/errors";
import type {
  ReportOutcome,
  ReportSummary,
  ScanReport,
} from "@refresh/scan-contracts/report";
import type { ScanRequest } from "@refresh/scan-contracts/scan-request";
import type { ScanResult } from "@refresh/scan-contracts/scan-result";
import type { ScanStatusValue } from "@refresh/scan-contracts/scan-status";

export type ScanOwner = {
  organizationId: string;
  startedByUserId: string;
  startedByName: string | null;
};

export type ScanKey = { scanId: string; organizationId: string };

export type StoredScan = ScanOwner & {
  scanId: string;
  startUrl: string;
  depth: number;
  status: ScanStatusValue;
  startedAt: string;
  finishedAt: string | null;
  report: ScanReport | null;
  error: ScanError | null;
};

export type ViolationsBySeverity = ReportSummary["violationsBySeverity"];

export type ScanHistoryEntry = {
  scanId: string;
  startedByUserId: string;
  startedByName: string | null;
  startUrl: string;
  status: ScanStatusValue;
  outcome: ReportOutcome | null;
  depth: number;
  startedAt: string;
  pagesScanned: number;
  violationsBySeverity: ViolationsBySeverity;
  error: ScanError | null;
  deletable: boolean;
};

export type ScanHistoryPage = {
  entries: ScanHistoryEntry[];
  nextBefore: string | null;
};

export type RecordOutcome = "recorded" | "already-final" | "not-found";

export type DeleteOutcome = "deleted" | "running" | "not-found";

export type CreateRunningInput = {
  scanId: string;
  request: ScanRequest;
  startedAt: Date;
  owner: ScanOwner;
};

export type HistoryPageRequest = {
  organizationId: string;
  before: string | null;
  limit: number;
};

export type ScanStore = {
  createRunning: (input: CreateRunningInput) => Promise<void>;
  discard: (scanId: string) => Promise<void>;
  recordResult: (result: ScanResult) => Promise<RecordOutcome>;
  get: (key: ScanKey) => Promise<StoredScan | null>;
  list: (page: HistoryPageRequest) => Promise<ScanHistoryPage>;
  settleStale: (cutoff: Date, finishedAt: Date) => Promise<number>;
  markInterrupted: (scanId: string, finishedAt: Date) => Promise<boolean>;
  deleteFinished: (key: ScanKey) => Promise<DeleteOutcome>;
  deleteByOrganization: (organizationId: string) => Promise<number>;
  close: () => Promise<void>;
};

export type UnreadableReport = {
  scanId: string;
  reportVersion: number | null;
};

export type UnreadableReportHandler = (report: UnreadableReport) => void;

export type ScanStoreOptions = {
  databaseUrl: string;
  onUnreadableReport?: UnreadableReportHandler;
};

import type { PageResult } from "@refresh/scan-contracts/page-result";
import type { ReportSummary, ScanReport } from "@refresh/scan-contracts/report";
import type { ScanStatus } from "@refresh/scan-contracts/scan-status";
import { START_URL } from "./finding-fixtures";

const EMPTY_SUMMARY: ReportSummary = {
	pagesScanned: 1,
	pagesSkipped: 0,
	pagesFailed: 0,
	totalViolations: 0,
	violationsBySeverity: { critical: 0, serious: 0, moderate: 0, minor: 0 },
	violationsByLevel: { A: 0, AA: 0 },
	needsReviewCount: 0,
};

const START_PAGE: PageResult = {
	url: START_URL,
	depth: 0,
	status: "scanned",
	reason: null,
	httpStatus: 200,
};

export const buildReport = (
	overrides: Partial<ScanReport> = {},
): ScanReport => ({
	startUrl: START_URL,
	origin: "https://www.example.org",
	depth: 0,
	outcome: "complete",
	startedAt: "2026-10-09T10:00:00.000Z",
	finishedAt: "2026-10-09T10:00:20.000Z",
	summary: EMPTY_SUMMARY,
	violations: [],
	reviewItems: [],
	manualChecks: [],
	pages: [START_PAGE],
	...overrides,
});

export const buildStatus = (
	overrides: Partial<ScanStatus> = {},
): ScanStatus => ({
	scanId: "scan-1",
	status: "running",
	progress: { pagesScanned: 0, pagesDiscovered: 1, currentUrl: START_URL },
	report: null,
	error: null,
	...overrides,
});

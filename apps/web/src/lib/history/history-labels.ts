import type { ReportOutcome } from "@refresh/scan-contracts/report";
import type { ScanStatusValue } from "@refresh/scan-contracts/scan-status";
import { firstParam, type SearchParams } from "@/lib/search-params";

export const STATUS_LABELS: Record<ScanStatusValue, string> = {
	running: "Running",
	completed: "Completed",
	cancelled: "Cancelled",
	failed: "Failed",
};

const PARTIAL_OUTCOMES: ReadonlySet<ReportOutcome> = new Set([
	"page-limit-reached",
	"time-limit-reached",
]);

export const isPartialOutcome = (outcome: ReportOutcome | null): boolean =>
	outcome !== null && PARTIAL_OUTCOMES.has(outcome);

export const readBefore = (params: SearchParams): string | null =>
	firstParam(params, "before") ?? null;

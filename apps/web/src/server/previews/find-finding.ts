import type { ReviewItem, Violation } from "@refresh/scan-contracts/findings";
import type { ScanReport } from "@refresh/scan-contracts/report";

export type Finding = Violation | ReviewItem;

export const findFinding = (
	report: ScanReport,
	findingId: string,
): Finding | null =>
	report.violations.find(({ id }) => id === findingId) ??
	report.reviewItems.find(({ id }) => id === findingId) ??
	null;

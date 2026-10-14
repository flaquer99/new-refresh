import type { ScanReport } from "@refresh/scan-contracts/report";
import {
	buildPreviewFindings,
	type Origins,
} from "./preview-seed-findings.mts";

const STARTED_AT = "2100-01-01T00:00:00.000Z";
const FINISHED_AT = "2100-01-01T00:01:00.000Z";

const summaryOf = (violationCount: number, reviewCount: number) => ({
	pagesScanned: 1,
	pagesSkipped: 0,
	pagesFailed: 0,
	totalViolations: violationCount,
	violationsBySeverity: {
		critical: 0,
		serious: violationCount,
		moderate: 0,
		minor: 0,
	},
	violationsByLevel: { A: 0, AA: violationCount },
	needsReviewCount: reviewCount,
});

export const buildPreviewReport = (origins: Origins): ScanReport => {
	const { violations, reviewItems } = buildPreviewFindings(origins);
	const startUrl = `${origins.fixtures}/low-contrast/`;
	return {
		startUrl,
		origin: origins.fixtures,
		depth: 0,
		outcome: "complete",
		startedAt: STARTED_AT,
		finishedAt: FINISHED_AT,
		summary: summaryOf(violations.length, reviewItems.length),
		violations,
		reviewItems,
		manualChecks: [],
		pages: [
			{
				url: startUrl,
				depth: 0,
				status: "scanned",
				reason: null,
				httpStatus: 200,
			},
		],
	};
};

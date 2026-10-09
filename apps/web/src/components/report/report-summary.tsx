import { SEVERITIES } from "@refresh/scan-contracts/findings";
import type { ScanReport } from "@refresh/scan-contracts/report";
import { OUTCOME_LABELS } from "@/lib/report/labels";
import { SEVERITY_LABELS } from "@/lib/report/severity";
import { type SummaryItem, SummaryList } from "./summary-list";

const HEADING_ID = "report-summary-heading";

type ReportSummaryProps = {
	report: ScanReport;
};

const scanItems = (report: ScanReport): SummaryItem[] => [
	{ term: "Website", value: report.startUrl },
	{ term: "Depth", value: report.depth },
	{ term: "Result", value: OUTCOME_LABELS[report.outcome] },
	{ term: "Pages scanned", value: report.summary.pagesScanned },
	{ term: "Pages skipped", value: report.summary.pagesSkipped },
	{ term: "Pages failed", value: report.summary.pagesFailed },
];

const findingItems = ({ summary }: ScanReport): SummaryItem[] => [
	{ term: "Violations", value: summary.totalViolations },
	...SEVERITIES.map((severity) => ({
		term: SEVERITY_LABELS[severity],
		value: summary.violationsBySeverity[severity],
	})),
	{ term: "Level A", value: summary.violationsByLevel.A },
	{ term: "Level AA", value: summary.violationsByLevel.AA },
	{ term: "Needs review", value: summary.needsReviewCount },
];

export function ReportSummary({ report }: ReportSummaryProps) {
	return (
		<section aria-labelledby={HEADING_ID} className="flex flex-col gap-4">
			<h2 className="font-semibold text-xl" id={HEADING_ID}>
				Summary
			</h2>
			<div className="grid gap-6 sm:grid-cols-2">
				<SummaryList items={scanItems(report)} title="Scan" />
				<SummaryList items={findingItems(report)} title="Findings" />
			</div>
		</section>
	);
}

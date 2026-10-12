import { SEVERITIES } from "@refresh/scan-contracts/findings";
import type { ScanReport } from "@refresh/scan-contracts/report";
import { HudPanel } from "@/components/hud/hud-panel";
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
		tone: severity,
	})),
	{ term: "Level A", value: summary.violationsByLevel.A },
	{ term: "Level AA", value: summary.violationsByLevel.AA },
	{ term: "Needs review", value: summary.needsReviewCount },
];

export function ReportSummary({ report }: ReportSummaryProps) {
	return (
		<HudPanel labelledBy={HEADING_ID}>
			<h2 className="font-heading font-semibold text-xl" id={HEADING_ID}>
				Summary
			</h2>
			<div className="grid gap-6">
				<SummaryList items={scanItems(report)} title="Scan" />
				<SummaryList items={findingItems(report)} title="Findings" />
			</div>
		</HudPanel>
	);
}

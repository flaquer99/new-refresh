import type { ScanReport } from "@refresh/scan-contracts/report";
import { useFocusOnMount } from "@/hooks/use-focus-on-mount";
import { NeedsReviewSection } from "./needs-review-section";
import { NewScanDialog } from "./new-scan-dialog";
import { PageCoverage } from "./page-coverage";
import { ReportDisclaimer } from "./report-disclaimer";
import { ReportSummary } from "./report-summary";
import { ViolationsSection } from "./violations-section";

type ReportViewProps = {
	report: ScanReport;
	onNewScan: () => void;
};

export function ReportView({ report, onNewScan }: ReportViewProps) {
	const headingRef = useFocusOnMount<HTMLHeadingElement>();
	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<h2
					className="break-all font-semibold text-2xl"
					ref={headingRef}
					tabIndex={-1}
				>
					Report for {report.startUrl}
				</h2>
				<NewScanDialog onConfirm={onNewScan} />
			</div>
			<ReportSummary report={report} />
			<ReportDisclaimer />
			<ViolationsSection violations={report.violations} />
			<NeedsReviewSection
				manualChecks={report.manualChecks}
				reviewItems={report.reviewItems}
			/>
			<PageCoverage pages={report.pages} />
		</div>
	);
}

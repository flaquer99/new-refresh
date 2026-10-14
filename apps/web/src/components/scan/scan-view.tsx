import type { ScanError } from "@refresh/scan-contracts/errors";
import { ReportView } from "@/components/report/report-view";
import type { StoredScan } from "@/server/scans/scan-read-models";
import { LiveScan } from "./live-scan";
import { ScanFailure } from "./scan-failure";

const MISSING_RESULT: ScanError = {
	code: "INTERNAL_ERROR",
	message: "The scan ended without a result. Run it again.",
};

type ScanViewProps = {
	scan: StoredScan;
	canManage: boolean;
};

export function ScanView({ scan, canManage }: ScanViewProps) {
	if (scan.status === "running") {
		return <LiveScan canCancel={canManage} scanId={scan.scanId} />;
	}
	if (scan.report) {
		return <ReportView report={scan.report} />;
	}
	return (
		<ScanFailure
			depth={scan.depth}
			error={scan.error ?? MISSING_RESULT}
			startUrl={scan.startUrl}
		/>
	);
}

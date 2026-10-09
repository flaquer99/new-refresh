import type { ScanHistoryEntry } from "@refresh/db/scan-store-types";
import { SeverityCounts } from "./severity-counts";

const IN_PROGRESS_LABEL = "Not available until the scan finishes";

type ScanEntryFindingsProps = {
	entry: ScanHistoryEntry;
};

export function ScanEntryFindings({ entry }: ScanEntryFindingsProps) {
	if (entry.status === "running") {
		return <span>{IN_PROGRESS_LABEL}</span>;
	}
	if (entry.error) {
		return <span className="text-destructive">{entry.error.message}</span>;
	}
	return <SeverityCounts counts={entry.violationsBySeverity} />;
}

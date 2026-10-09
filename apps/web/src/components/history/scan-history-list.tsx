import type { ScanHistoryEntry as Entry } from "@refresh/db/scan-store-types";
import { ScanHistoryEntry } from "./scan-history-entry";

type ScanHistoryListProps = {
	entries: readonly Entry[];
	now: Date;
	labelledBy: string;
};

export function ScanHistoryList({
	entries,
	now,
	labelledBy,
}: ScanHistoryListProps) {
	return (
		<ol aria-labelledby={labelledBy} className="flex flex-col gap-4">
			{entries.map((entry) => (
				<li key={entry.scanId}>
					<ScanHistoryEntry entry={entry} now={now} />
				</li>
			))}
		</ol>
	);
}

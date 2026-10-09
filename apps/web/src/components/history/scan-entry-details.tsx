import type { ScanHistoryEntry } from "@refresh/db/scan-store-types";
import { HistoryStatus } from "./history-status";
import { RelativeTime } from "./relative-time";
import { ScanEntryFindings } from "./scan-entry-findings";

const TERM_CLASSES = "font-medium text-muted-foreground";

type ScanEntryDetailsProps = {
	entry: ScanHistoryEntry;
	now: Date;
};

export function ScanEntryDetails({ entry, now }: ScanEntryDetailsProps) {
	return (
		<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
			<dt className={TERM_CLASSES}>Status</dt>
			<dd>
				<HistoryStatus outcome={entry.outcome} status={entry.status} />
			</dd>
			<dt className={TERM_CLASSES}>Started</dt>
			<dd>
				<RelativeTime iso={entry.startedAt} now={now} />
			</dd>
			<dt className={TERM_CLASSES}>Depth</dt>
			<dd>{entry.depth}</dd>
			<dt className={TERM_CLASSES}>Pages scanned</dt>
			<dd>{entry.pagesScanned}</dd>
			<dt className={TERM_CLASSES}>{entry.error ? "Reason" : "Violations"}</dt>
			<dd>
				<ScanEntryFindings entry={entry} />
			</dd>
		</dl>
	);
}

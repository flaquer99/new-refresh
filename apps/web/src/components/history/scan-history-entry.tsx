import Link from "next/link";
import { scanLinkPath } from "@/lib/scans/scan-links";
import type { ScanHistoryEntry as Entry } from "@/server/scans/scan-read-models";
import { DeleteScanButton } from "./delete-scan-button";
import { ScanEntryDetails } from "./scan-entry-details";

type ScanHistoryEntryProps = {
	entry: Entry;
	now: Date;
};

export function ScanHistoryEntry({ entry, now }: ScanHistoryEntryProps) {
	const titleId = `scan-${entry.scanId}-title`;
	return (
		<article
			aria-labelledby={titleId}
			className="hud-frame grid gap-4 rounded-md bg-card p-4 text-card-foreground md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] md:items-start md:gap-6"
		>
			<h2 className="break-all font-mono font-semibold text-base" id={titleId}>
				<Link
					className="text-primary underline underline-offset-4"
					href={scanLinkPath(entry.scanId)}
				>
					{entry.startUrl}
				</Link>
			</h2>
			<ScanEntryDetails entry={entry} now={now} />
			{entry.deletable ? (
				<DeleteScanButton scanId={entry.scanId} startUrl={entry.startUrl} />
			) : null}
		</article>
	);
}

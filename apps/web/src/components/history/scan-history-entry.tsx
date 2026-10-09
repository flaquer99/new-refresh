import type { ScanHistoryEntry as Entry } from "@refresh/db/scan-store-types";
import Link from "next/link";
import { scanLinkPath } from "@/lib/scans/scan-links";
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
			className="flex flex-col gap-3 rounded-lg border border-border p-4"
		>
			<div className="flex flex-wrap items-start justify-between gap-2">
				<h2 className="break-all font-semibold text-lg" id={titleId}>
					<Link
						className="text-primary underline underline-offset-4"
						href={scanLinkPath(entry.scanId)}
					>
						{entry.startUrl}
					</Link>
				</h2>
				{entry.deletable ? (
					<DeleteScanButton scanId={entry.scanId} startUrl={entry.startUrl} />
				) : null}
			</div>
			<ScanEntryDetails entry={entry} now={now} />
		</article>
	);
}

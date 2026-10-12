import Link from "next/link";
import { NEW_SCAN_PATH } from "@/lib/scans/scan-links";

const NO_SCANS_MESSAGE =
	"No scans yet. Every scan anyone runs appears here, newest first.";
const NO_OLDER_SCANS_MESSAGE =
	"No older scans. Go back to the newest scans to see recent ones.";

type EmptyHistoryProps = {
	isPaged: boolean;
};

export function EmptyHistory({ isPaged }: EmptyHistoryProps) {
	return (
		<div className="flex flex-col items-start gap-3 rounded-lg border border-border p-4">
			<p>{isPaged ? NO_OLDER_SCANS_MESSAGE : NO_SCANS_MESSAGE}</p>
			<Link
				className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
				href={NEW_SCAN_PATH}
			>
				Start a new scan
			</Link>
		</div>
	);
}

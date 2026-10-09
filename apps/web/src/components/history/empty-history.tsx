import Link from "next/link";
import { NEW_SCAN_PATH } from "@/lib/scans/scan-links";

export function EmptyHistory() {
	return (
		<div className="flex flex-col items-start gap-3 rounded-lg border border-border p-4">
			<p>No scans yet. Every scan anyone runs appears here, newest first.</p>
			<Link
				className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
				href={NEW_SCAN_PATH}
			>
				Start a new scan
			</Link>
		</div>
	);
}

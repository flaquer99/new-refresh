import Link from "next/link";
import { NEW_SCAN_PATH } from "@/lib/scans/scan-links";

export function Wordmark() {
	return (
		<Link
			className="flex items-baseline gap-2 rounded-md font-heading"
			href={NEW_SCAN_PATH}
		>
			<span className="font-semibold text-lg text-primary tracking-tight">
				Refresh
			</span>
			<span className="font-mono text-muted-foreground text-xs uppercase tracking-widest">
				by 99x
			</span>
		</Link>
	);
}

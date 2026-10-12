import type { ScanError } from "@refresh/scan-contracts/errors";
import Link from "next/link";
import { HudPanel } from "@/components/hud/hud-panel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { runAgainHref } from "@/lib/scans/prefill";
import { HISTORY_PATH } from "@/lib/scans/scan-links";

const HEADING_ID = "scan-failure-heading";

type ScanFailureProps = {
	error: ScanError;
	startUrl: string;
	depth: number;
};

export function ScanFailure({ error, startUrl, depth }: ScanFailureProps) {
	return (
		<HudPanel labelledBy={HEADING_ID} title="Scan failed">
			<h2 className="font-semibold text-xl" id={HEADING_ID}>
				The scan couldn't finish
			</h2>
			<Alert variant="destructive">
				<AlertDescription>{error.message}</AlertDescription>
			</Alert>
			<div className="flex flex-wrap gap-3">
				<Link
					className={buttonVariants({ size: "lg" })}
					href={runAgainHref({ url: startUrl, depth })}
				>
					Run again
				</Link>
				<Link
					className={buttonVariants({ size: "lg", variant: "outline" })}
					href={HISTORY_PATH}
				>
					View scan history
				</Link>
			</div>
		</HudPanel>
	);
}

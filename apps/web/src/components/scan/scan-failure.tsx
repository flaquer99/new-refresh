import type { ScanError } from "@refresh/scan-contracts/errors";
import Link from "next/link";
import { runAgainHref } from "@/lib/scans/prefill";

const HEADING_ID = "scan-failure-heading";

type ScanFailureProps = {
	error: ScanError;
	startUrl: string;
	depth: number;
};

export function ScanFailure({ error, startUrl, depth }: ScanFailureProps) {
	return (
		<section
			aria-labelledby={HEADING_ID}
			className="flex flex-col gap-4 rounded-lg border border-destructive p-4 sm:p-6"
		>
			<h2 className="font-semibold text-xl" id={HEADING_ID}>
				The scan couldn't finish
			</h2>
			<p className="text-destructive">{error.message}</p>
			<Link
				className="self-start rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
				href={runAgainHref({ url: startUrl, depth })}
			>
				Run again
			</Link>
		</section>
	);
}

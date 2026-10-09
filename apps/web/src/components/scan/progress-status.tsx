import type { ScanProgress } from "@refresh/scan-contracts/scan-status";

type ProgressStatusProps = {
	progress: ScanProgress;
};

export function ProgressStatus({ progress }: ProgressStatusProps) {
	return (
		<output aria-live="polite" className="flex flex-col gap-1">
			<span className="tabular-nums">
				{progress.pagesScanned} of {progress.pagesDiscovered} discovered pages
				scanned
			</span>
			<span className="break-all text-muted-foreground">
				{progress.currentUrl === null
					? "Preparing the scan…"
					: `Now scanning: ${progress.currentUrl}`}
			</span>
		</output>
	);
}

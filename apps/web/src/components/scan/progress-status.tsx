import type { ScanProgress } from "@refresh/scan-contracts/scan-status";
import { MonoValue } from "@/components/hud/mono-value";
import { StatusIndicator } from "@/components/hud/status-indicator";
import { Progress, ProgressValue } from "@/components/ui/progress";

const PERCENT_FACTOR = 100;

type ProgressStatusProps = {
	progress: ScanProgress;
};

const percentScanned = ({
	pagesScanned,
	pagesDiscovered,
}: ScanProgress): number | null => {
	if (pagesDiscovered === 0) {
		return null;
	}
	return Math.min(
		PERCENT_FACTOR,
		(pagesScanned / pagesDiscovered) * PERCENT_FACTOR,
	);
};

export function ProgressStatus({ progress }: ProgressStatusProps) {
	return (
		<div className="flex flex-col gap-3">
			<Progress aria-label="Pages scanned" value={percentScanned(progress)}>
				<StatusIndicator active label="Scanning" />
				<ProgressValue>
					{() => `${progress.pagesScanned} / ${progress.pagesDiscovered}`}
				</ProgressValue>
			</Progress>
			<output aria-live="polite" className="flex flex-col gap-1">
				<span className="tabular-nums">
					{progress.pagesScanned} of {progress.pagesDiscovered} discovered pages
					scanned
				</span>
				<MonoValue className="text-muted-foreground">
					{progress.currentUrl === null
						? "Preparing the scan…"
						: `Now scanning: ${progress.currentUrl}`}
				</MonoValue>
			</output>
		</div>
	);
}

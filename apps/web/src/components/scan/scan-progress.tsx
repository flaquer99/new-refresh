import type { ScanProgress as Progress } from "@refresh/scan-contracts/scan-status";
import { useFocusOnMount } from "@/hooks/use-focus-on-mount";
import { CancelScanButton } from "./cancel-scan-button";
import { ProgressStatus } from "./progress-status";

const HEADING_ID = "scan-progress-heading";

type ScanProgressProps = {
	progress: Progress;
	onCancel: () => void;
};

export function ScanProgress({ progress, onCancel }: ScanProgressProps) {
	const headingRef = useFocusOnMount<HTMLHeadingElement>();
	return (
		<section
			aria-labelledby={HEADING_ID}
			className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:p-6"
		>
			<h2
				className="font-semibold text-xl"
				id={HEADING_ID}
				ref={headingRef}
				tabIndex={-1}
			>
				Scan in progress
			</h2>
			<ProgressStatus progress={progress} />
			<CancelScanButton onCancel={onCancel} />
		</section>
	);
}

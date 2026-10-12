import type { ScanProgress as Progress } from "@refresh/scan-contracts/scan-status";
import { HudPanel } from "@/components/hud/hud-panel";
import { useFocusOnMount } from "@/hooks/use-focus-on-mount";
import { CancelScanButton } from "./cancel-scan-button";
import { ProgressStatus } from "./progress-status";

const HEADING_ID = "scan-progress-heading";

type ScanProgressProps = {
	progress: Progress;
	onCancel: () => Promise<boolean>;
};

export function ScanProgress({ progress, onCancel }: ScanProgressProps) {
	const headingRef = useFocusOnMount<HTMLHeadingElement>();
	return (
		<HudPanel labelledBy={HEADING_ID} title="Scan console">
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
		</HudPanel>
	);
}

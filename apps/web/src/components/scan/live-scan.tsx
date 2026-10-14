"use client";

import { useLiveScan } from "@/hooks/use-live-scan";
import { PollErrorNotice } from "./poll-error-notice";
import { ScanProgress } from "./scan-progress";

type LiveScanProps = {
	scanId: string;
	canCancel: boolean;
};

export function LiveScan({ scanId, canCancel }: LiveScanProps) {
	const { progress, pollError, cancel, retry } = useLiveScan(scanId);
	return (
		<div className="flex flex-col gap-4">
			<ScanProgress
				canCancel={canCancel}
				onCancel={cancel}
				progress={progress}
			/>
			{pollError ? <PollErrorNotice error={pollError} onRetry={retry} /> : null}
		</div>
	);
}

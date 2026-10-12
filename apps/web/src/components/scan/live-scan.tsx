"use client";

import { useLiveScan } from "@/hooks/use-live-scan";
import { PollErrorNotice } from "./poll-error-notice";
import { ScanProgress } from "./scan-progress";

type LiveScanProps = {
	scanId: string;
};

export function LiveScan({ scanId }: LiveScanProps) {
	const { progress, pollError, cancel, retry } = useLiveScan(scanId);
	return (
		<div className="flex flex-col gap-4">
			<ScanProgress onCancel={cancel} progress={progress} />
			{pollError ? <PollErrorNotice error={pollError} onRetry={retry} /> : null}
		</div>
	);
}

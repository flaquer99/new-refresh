import type { ScanStatus } from "@refresh/scan-contracts/scan-status";
import type { ApiResult } from "@/lib/scans/request-json";
import { cancelScan } from "@/lib/scans/scan-api";
import { isTransientError } from "@/lib/scans/schedule-polling";
import { useScanPolling } from "./use-scan-polling";
import { useScanStatus } from "./use-scan-status";

const finishedBeforeCancel = (result: ApiResult<ScanStatus>): boolean =>
	!result.ok && result.error.code === "SCAN_NOT_FOUND";

export function useLiveScan(scanId: string) {
	const { progress, pollError, apply, clearError, refresh } = useScanStatus();
	const pollingStopped = pollError !== null && !isTransientError(pollError);
	const { pollNow } = useScanPolling({
		scanId: pollingStopped ? null : scanId,
		onResult: apply,
	});
	const cancel = async (): Promise<boolean> => {
		const result = await cancelScan(scanId);
		if (finishedBeforeCancel(result)) {
			refresh();
			return true;
		}
		apply(result);
		return result.ok;
	};
	const retry = () => {
		clearError();
		pollNow();
	};
	return { progress, pollError, cancel, retry };
}

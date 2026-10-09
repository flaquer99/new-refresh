import type { ScanError } from "@refresh/scan-contracts/errors";
import type {
	ScanProgress,
	ScanStatus,
} from "@refresh/scan-contracts/scan-status";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ApiResult } from "@/lib/scans/request-json";
import { cancelScan } from "@/lib/scans/scan-api";
import { useScanPolling } from "./use-scan-polling";

export const INITIAL_PROGRESS: ScanProgress = {
	pagesScanned: 0,
	pagesDiscovered: 0,
	currentUrl: null,
};

export function useLiveScan(scanId: string) {
	const router = useRouter();
	const [progress, setProgress] = useState<ScanProgress>(INITIAL_PROGRESS);
	const [pollError, setPollError] = useState<ScanError | null>(null);
	const apply = (result: ApiResult<ScanStatus>) => {
		if (!result.ok) {
			setPollError(result.error);
			return;
		}
		if (result.data.status === "running") {
			setProgress(result.data.progress);
			return;
		}
		router.refresh();
	};
	useScanPolling({ scanId: pollError ? null : scanId, onResult: apply });
	const cancel = async () => {
		apply(await cancelScan(scanId));
	};
	const retry = () => {
		setPollError(null);
	};
	return { progress, pollError, cancel, retry };
}

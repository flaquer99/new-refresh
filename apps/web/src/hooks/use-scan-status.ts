import type { ScanError } from "@refresh/scan-contracts/errors";
import type {
	ScanProgress,
	ScanStatus,
} from "@refresh/scan-contracts/scan-status";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ApiResult } from "@/lib/scans/request-json";

export const INITIAL_PROGRESS: ScanProgress = {
	pagesScanned: 0,
	pagesDiscovered: 0,
	currentUrl: null,
};

export function useScanStatus() {
	const router = useRouter();
	const [progress, setProgress] = useState<ScanProgress>(INITIAL_PROGRESS);
	const [pollError, setPollError] = useState<ScanError | null>(null);
	const apply = (result: ApiResult<ScanStatus>) => {
		if (!result.ok) {
			setPollError(result.error);
			return;
		}
		setPollError(null);
		if (result.data.status === "running") {
			setProgress(result.data.progress);
			return;
		}
		router.refresh();
	};
	const clearError = () => {
		setPollError(null);
	};
	const refresh = () => {
		router.refresh();
	};
	return { progress, pollError, apply, clearError, refresh };
}

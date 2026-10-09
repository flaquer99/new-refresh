import type { ScanError } from "@refresh/scan-contracts/errors";
import type { ScanReport } from "@refresh/scan-contracts/report";
import type {
	ScanProgress,
	ScanStatus,
} from "@refresh/scan-contracts/scan-status";

export type UseScanState =
	| { phase: "idle" }
	| { phase: "starting" }
	| { phase: "running"; scanId: string; progress: ScanProgress }
	| { phase: "finished"; report: ScanReport }
	| { phase: "failed"; error: ScanError };

const MISSING_RESULT: ScanError = {
	code: "INTERNAL_ERROR",
	message: "The scan ended without a result. Try again in a moment.",
};

export const INITIAL_PROGRESS: ScanProgress = {
	pagesScanned: 0,
	pagesDiscovered: 0,
	currentUrl: null,
};

export const stateFromStatus = (status: ScanStatus): UseScanState => {
	if (status.status === "running") {
		return {
			phase: "running",
			scanId: status.scanId,
			progress: status.progress,
		};
	}
	if (status.report !== null) {
		return { phase: "finished", report: status.report };
	}
	return { phase: "failed", error: status.error ?? MISSING_RESULT };
};

import type { ScanError } from "@refresh/scan-contracts/errors";
import type {
	CreateScanResponse,
	ScanRequest,
} from "@refresh/scan-contracts/scan-request";
import type { ScanStatus } from "@refresh/scan-contracts/scan-status";
import { useState } from "react";
import type { ApiResult } from "@/lib/scans/request-json";
import { cancelScan, startScan } from "@/lib/scans/scan-api";
import {
	INITIAL_PROGRESS,
	stateFromStatus,
	type UseScanState,
} from "@/lib/scans/scan-state";
import { useScanPolling } from "./use-scan-polling";

export type UseScan = {
	state: UseScanState;
	start: (request: ScanRequest) => Promise<void>;
	cancel: () => Promise<void>;
	reset: () => void;
};

const IDLE: UseScanState = { phase: "idle" };
const STARTING: UseScanState = { phase: "starting" };

const failed = (error: ScanError): UseScanState => ({ phase: "failed", error });

const toState = (result: ApiResult<ScanStatus>): UseScanState =>
	result.ok ? stateFromStatus(result.data) : failed(result.error);

const startedState = (result: ApiResult<CreateScanResponse>): UseScanState =>
	result.ok
		? {
				phase: "running",
				scanId: result.data.scanId,
				progress: INITIAL_PROGRESS,
			}
		: failed(result.error);

export function useScan(): UseScan {
	const [state, setState] = useState<UseScanState>(IDLE);
	const scanId = state.phase === "running" ? state.scanId : null;
	const applyWhileRunning = async (result: ApiResult<ScanStatus>) => {
		setState((current) =>
			current.phase === "running" ? toState(result) : current,
		);
		if (!result.ok && scanId !== null) {
			await cancelScan(scanId);
		}
	};
	useScanPolling({ scanId, onResult: applyWhileRunning });
	const start = async (request: ScanRequest) => {
		setState(STARTING);
		const next = startedState(await startScan(request));
		setState((current) => (current.phase === "starting" ? next : current));
	};
	const cancel = async () => {
		if (scanId === null) {
			return;
		}
		await applyWhileRunning(await cancelScan(scanId));
	};
	const reset = () => {
		setState(IDLE);
	};
	return { state, start, cancel, reset };
}

import type { ScanErrorCode } from "@refresh/scan-contracts/errors";
import { POLL_INTERVAL_MS } from "@refresh/scan-contracts/limits";
import {
	isTerminalStatus,
	type ScanStatus,
} from "@refresh/scan-contracts/scan-status";
import { useEffect, useEffectEvent } from "react";
import type { ApiResult } from "@/lib/scans/request-json";
import { getScan } from "@/lib/scans/scan-api";

export const MAX_TRANSIENT_POLL_RETRIES = 3;

const TRANSIENT_ERROR_CODES: ReadonlySet<ScanErrorCode> = new Set([
	"WORKER_UNAVAILABLE",
	"INTERNAL_ERROR",
]);

type ResultHandler = (result: ApiResult<ScanStatus>) => Promise<void>;

type UseScanPollingParams = {
	scanId: string | null;
	onResult: ResultHandler;
};

const shouldKeepPolling = (result: ApiResult<ScanStatus>): boolean =>
	result.ok && !isTerminalStatus(result.data.status);

const isTransientFailure = (result: ApiResult<ScanStatus>): boolean =>
	!result.ok && TRANSIENT_ERROR_CODES.has(result.error.code);

const createRetryBudget = () => {
	let consecutiveFailures = 0;
	return (result: ApiResult<ScanStatus>): boolean => {
		consecutiveFailures = isTransientFailure(result)
			? consecutiveFailures + 1
			: 0;
		return (
			consecutiveFailures > 0 &&
			consecutiveFailures <= MAX_TRANSIENT_POLL_RETRIES
		);
	};
};

const schedulePolling = (scanId: string, onResult: ResultHandler) => {
	let active = true;
	let timer: ReturnType<typeof setTimeout> | undefined;
	const shouldRetry = createRetryBudget();
	const poll = async () => {
		const result = await getScan(scanId);
		if (!active) {
			return;
		}
		const retrying = shouldRetry(result);
		if (retrying || shouldKeepPolling(result)) {
			timer = setTimeout(poll, POLL_INTERVAL_MS);
		}
		if (!retrying) {
			await onResult(result);
		}
	};
	timer = setTimeout(poll, POLL_INTERVAL_MS);
	return () => {
		active = false;
		clearTimeout(timer);
	};
};

export function useScanPolling({ scanId, onResult }: UseScanPollingParams) {
	const handleResult = useEffectEvent(onResult);
	useEffect(() => {
		if (scanId === null) {
			return;
		}
		const stopPolling = schedulePolling(scanId, (result) =>
			handleResult(result),
		);
		return () => {
			stopPolling();
		};
	}, [scanId]);
}

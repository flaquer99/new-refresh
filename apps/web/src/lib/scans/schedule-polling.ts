import type { ScanError, ScanErrorCode } from "@refresh/scan-contracts/errors";
import { POLL_INTERVAL_MS } from "@refresh/scan-contracts/limits";
import {
	isTerminalStatus,
	type ScanStatus,
} from "@refresh/scan-contracts/scan-status";
import type { ApiResult } from "./request-json";
import { getScan } from "./scan-api";

export const MAX_TRANSIENT_POLL_RETRIES = 3;

const IMMEDIATE_POLL_DELAY_MS = 0;

const TRANSIENT_ERROR_CODES: ReadonlySet<ScanErrorCode> = new Set([
	"WORKER_UNAVAILABLE",
	"INTERNAL_ERROR",
]);

export type ResultHandler = (result: ApiResult<ScanStatus>) => void;

export type Polling = { stop: () => void; pollNow: () => void };

export const isTransientError = (error: ScanError): boolean =>
	TRANSIENT_ERROR_CODES.has(error.code);

const isTransientFailure = (result: ApiResult<ScanStatus>): boolean =>
	!result.ok && isTransientError(result.error);

const shouldKeepPolling = (result: ApiResult<ScanStatus>): boolean =>
	isTransientFailure(result) ||
	(result.ok && !isTerminalStatus(result.data.status));

const createSilentRetryBudget = () => {
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

type PollState = {
	active: boolean;
	inFlight: boolean;
	timer: ReturnType<typeof setTimeout> | undefined;
};

const createPoll = (
	state: PollState,
	scanId: string,
	onResult: ResultHandler,
) => {
	const isSilentRetry = createSilentRetryBudget();
	const poll = async () => {
		state.inFlight = true;
		const result = await getScan(scanId);
		state.inFlight = false;
		if (!state.active) {
			return;
		}
		if (shouldKeepPolling(result)) {
			state.timer = setTimeout(poll, POLL_INTERVAL_MS);
		}
		if (!isSilentRetry(result)) {
			onResult(result);
		}
	};
	return poll;
};

export const schedulePolling = (
	scanId: string,
	onResult: ResultHandler,
): Polling => {
	const state: PollState = { active: true, inFlight: false, timer: undefined };
	const poll = createPoll(state, scanId, onResult);
	const pollNow = () => {
		if (!state.active || state.inFlight) {
			return;
		}
		clearTimeout(state.timer);
		state.timer = setTimeout(poll, IMMEDIATE_POLL_DELAY_MS);
	};
	pollNow();
	const stop = () => {
		state.active = false;
		clearTimeout(state.timer);
	};
	return { stop, pollNow };
};

import { POLL_INTERVAL_MS } from "@refresh/scan-contracts/limits";
import { act } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

export const CREATED = { body: { scanId: "scan-1" }, status: 201 };

export const WORKER_DOWN_ERROR = {
	code: "WORKER_UNAVAILABLE",
	message: "The scanner is not available right now. Try again in a moment.",
} as const;

export const WORKER_DOWN = { body: { error: WORKER_DOWN_ERROR }, status: 502 };

export const installFakeTimersPerTest = (): void => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});
};

export const advanceTime = async (ms: number): Promise<void> => {
	await act(async () => {
		await vi.advanceTimersByTimeAsync(ms);
	});
};

export const advancePoll = async (): Promise<void> => {
	await advanceTime(POLL_INTERVAL_MS);
};

export const advancePolls = async (count: number): Promise<void> => {
	for (let poll = 0; poll < count; poll += 1) {
		await advancePoll();
	}
};

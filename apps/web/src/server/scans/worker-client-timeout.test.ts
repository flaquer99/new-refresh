import { afterEach, describe, expect, it, vi } from "vitest";
import { stubHangingWorker, WORKER_TIMEOUT_MS } from "@/testing/stub-worker";
import { forwardToWorker } from "./worker-client";

const CUSTOM_TIMEOUT_MS = 12_000;

describe("forwardToWorker custom timeout", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("aborts after the request's own timeout instead of the default", async () => {
		// GIVEN
		vi.useFakeTimers();
		const signals = stubHangingWorker();

		// WHEN
		const pending = forwardToWorker({
			method: "POST",
			path: "/previews",
			clientId: "c",
			timeoutMs: CUSTOM_TIMEOUT_MS,
		});
		await vi.advanceTimersByTimeAsync(WORKER_TIMEOUT_MS);
		const abortedAtDefault = signals[0]?.aborted;
		await vi.advanceTimersByTimeAsync(CUSTOM_TIMEOUT_MS - WORKER_TIMEOUT_MS);
		await pending;

		// THEN
		expect([abortedAtDefault, signals[0]?.aborted]).toEqual([false, true]);
	});
});

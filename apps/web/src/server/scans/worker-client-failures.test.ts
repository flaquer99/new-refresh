import { afterEach, describe, expect, it, vi } from "vitest";
import {
	stubHangingWorker,
	stubUnreachableWorker,
	stubWorker,
	WORKER_TIMEOUT_MS,
} from "@/testing/stub-worker";
import { forwardToWorker } from "./worker-client";

const pollScan = () =>
	forwardToWorker({ method: "GET", path: "/scans/abc", clientId: "c" });

const describeError = async (response: Response) => ({
	status: response.status,
	code: (await response.json()).error.code,
});

describe("forwardToWorker failures", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("refuses to call the worker without a configured token", async () => {
		// GIVEN
		const calls = stubWorker(200, {});
		vi.stubEnv("SCAN_WORKER_TOKEN", undefined);

		// WHEN
		const response = await pollScan();

		// THEN
		expect({
			...(await describeError(response)),
			workerCalls: calls.length,
		}).toEqual({
			status: 500,
			code: "INTERNAL_ERROR",
			workerCalls: 0,
		});
	});

	it("maps an unreachable worker to 502 WORKER_UNAVAILABLE", async () => {
		// GIVEN
		stubUnreachableWorker();

		// WHEN
		const response = await pollScan();

		// THEN
		expect(await describeError(response)).toEqual({
			status: 502,
			code: "WORKER_UNAVAILABLE",
		});
	});

	it("does not abort the worker request before 10 s have passed", async () => {
		// GIVEN
		vi.useFakeTimers();
		const signals = stubHangingWorker();

		// WHEN
		const pending = pollScan();
		await vi.advanceTimersByTimeAsync(WORKER_TIMEOUT_MS - 1);
		const abortedBeforeTimeout = signals[0]?.aborted;
		await vi.advanceTimersByTimeAsync(1);
		await pending;

		// THEN
		expect(abortedBeforeTimeout).toBe(false);
	});

	it("maps a worker that does not answer within 10 s to 502 WORKER_UNAVAILABLE", async () => {
		// GIVEN
		vi.useFakeTimers();
		stubHangingWorker();

		// WHEN
		const pending = pollScan();
		await vi.advanceTimersByTimeAsync(WORKER_TIMEOUT_MS);
		const response = await pending;

		// THEN
		expect(await describeError(response)).toEqual({
			status: 502,
			code: "WORKER_UNAVAILABLE",
		});
	});
});

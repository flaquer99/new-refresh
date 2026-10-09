import { describe, expect, it } from "vitest";
import { callsWithMethod, stubFetchQueue } from "@/testing/fetch-queue";
import {
	advancePoll,
	advancePolls,
	CREATED,
	installFakeTimersPerTest,
	WORKER_DOWN,
	WORKER_DOWN_ERROR,
} from "@/testing/polling";
import { buildStatus } from "@/testing/report-fixtures";
import { startScanHook } from "@/testing/start-scan-hook";
import { MAX_TRANSIENT_POLL_RETRIES } from "./use-scan-polling";

const RUNNING = { body: buildStatus() };
const failuresWithinBudget = Array.from(
	{ length: MAX_TRANSIENT_POLL_RETRIES },
	() => WORKER_DOWN,
);

installFakeTimersPerTest();

describe("useScan transient failures", () => {
	it("keeps running when a poll fails transiently", async () => {
		// GIVEN
		stubFetchQueue([CREATED, WORKER_DOWN, RUNNING]);
		const { result } = await startScanHook();

		// WHEN
		await advancePoll();

		// THEN
		expect(result.current.state.phase).toBe("running");
	});

	it("fails once consecutive transient poll failures exceed the retry budget", async () => {
		// GIVEN
		stubFetchQueue([CREATED, WORKER_DOWN]);
		const { result } = await startScanHook();

		// WHEN
		await advancePolls(MAX_TRANSIENT_POLL_RETRIES + 1);

		// THEN
		expect(result.current.state).toEqual({
			phase: "failed",
			error: WORKER_DOWN_ERROR,
		});
	});

	it("resets the retry budget after a successful poll", async () => {
		// GIVEN
		stubFetchQueue([
			CREATED,
			...failuresWithinBudget,
			RUNNING,
			...failuresWithinBudget,
			RUNNING,
		]);
		const { result } = await startScanHook();

		// WHEN
		await advancePolls(2 * MAX_TRANSIENT_POLL_RETRIES + 1);

		// THEN
		expect(result.current.state.phase).toBe("running");
	});

	it("asks the worker to cancel when a poll error ends the scan", async () => {
		// GIVEN
		const fetchMock = stubFetchQueue([CREATED, WORKER_DOWN]);
		await startScanHook();

		// WHEN
		await advancePolls(MAX_TRANSIENT_POLL_RETRIES + 1);

		// THEN
		expect(callsWithMethod(fetchMock, "DELETE")).toBe(1);
	});
});

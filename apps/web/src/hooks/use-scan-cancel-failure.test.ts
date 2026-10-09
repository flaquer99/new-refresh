import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { callsWithMethod, stubFetchQueue } from "@/testing/fetch-queue";
import {
	CREATED,
	installFakeTimersPerTest,
	WORKER_DOWN,
	WORKER_DOWN_ERROR,
} from "@/testing/polling";
import { startScanHook } from "@/testing/start-scan-hook";

installFakeTimersPerTest();

describe("useScan cancel failure", () => {
	it("fails with the cancel error when the cancel request fails", async () => {
		// GIVEN
		stubFetchQueue([CREATED, WORKER_DOWN]);
		const { result } = await startScanHook();

		// WHEN
		await act(async () => {
			await result.current.cancel();
		});

		// THEN
		expect(result.current.state).toEqual({
			phase: "failed",
			error: WORKER_DOWN_ERROR,
		});
	});

	it("retries the cancel when the cancel request fails", async () => {
		// GIVEN
		const fetchMock = stubFetchQueue([CREATED, WORKER_DOWN]);
		const { result } = await startScanHook();

		// WHEN
		await act(async () => {
			await result.current.cancel();
		});

		// THEN
		expect(callsWithMethod(fetchMock, "DELETE")).toBe(2);
	});
});

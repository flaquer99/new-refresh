import { POLL_INTERVAL_MS } from "@refresh/scan-contracts/limits";
import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { callsWithMethod, stubFetchQueue } from "@/testing/fetch-queue";
import { renderLiveScan } from "@/testing/live-scan-hook";
import {
	advancePoll,
	advancePolls,
	advanceTime,
	installFakeTimersPerTest,
	WORKER_DOWN,
	WORKER_DOWN_ERROR,
} from "@/testing/polling";
import { buildStatus } from "@/testing/report-fixtures";
import { mockRouter } from "@/testing/router";
import { MAX_TRANSIENT_POLL_RETRIES } from "./use-scan-polling";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));

const RUNNING = { body: buildStatus() };

installFakeTimersPerTest();

describe("useLiveScan polling", () => {
	it("does not poll before the 2 s interval has elapsed", async () => {
		// GIVEN
		mockRouter();
		const fetchMock = stubFetchQueue([RUNNING]);
		renderLiveScan();

		// WHEN
		await advanceTime(POLL_INTERVAL_MS - 1);

		// THEN
		expect(callsWithMethod(fetchMock, "GET")).toBe(0);
	});

	it("keeps polling silently through transient failures within the budget", async () => {
		// GIVEN
		mockRouter();
		stubFetchQueue([WORKER_DOWN, RUNNING]);
		const { result } = renderLiveScan();

		// WHEN
		await advancePoll();

		// THEN
		expect(result.current.pollError).toBeNull();
	});

	it("reports the error once transient failures exceed the retry budget", async () => {
		// GIVEN
		mockRouter();
		stubFetchQueue([WORKER_DOWN]);
		const { result } = renderLiveScan();

		// WHEN
		await advancePolls(MAX_TRANSIENT_POLL_RETRIES + 1);

		// THEN
		expect(result.current.pollError).toEqual(WORKER_DOWN_ERROR);
	});

	it("resumes polling after the user asks to check again", async () => {
		// GIVEN
		mockRouter();
		const fetchMock = stubFetchQueue([WORKER_DOWN]);
		const { result } = renderLiveScan();
		await advancePolls(MAX_TRANSIENT_POLL_RETRIES + 1);
		const pollsBefore = callsWithMethod(fetchMock, "GET");

		// WHEN
		act(() => {
			result.current.retry();
		});
		await advancePoll();

		// THEN
		expect(callsWithMethod(fetchMock, "GET")).toBe(pollsBefore + 1);
	});
});

import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MAX_TRANSIENT_POLL_RETRIES } from "@/lib/scans/schedule-polling";
import { callsWithMethod, stubFetchQueue } from "@/testing/fetch-queue";
import { renderLiveScan } from "@/testing/live-scan-hook";
import {
	advancePoll,
	advancePolls,
	advanceTime,
	installFakeTimersPerTest,
	SCAN_GONE,
	WORKER_DOWN,
	WORKER_DOWN_ERROR,
} from "@/testing/polling";
import { buildStatus } from "@/testing/report-fixtures";
import { mockRouter } from "@/testing/router";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));

const RUNNING = { body: buildStatus() };

installFakeTimersPerTest();

describe("useLiveScan polling", () => {
	it("polls as soon as the scan link opens", async () => {
		// GIVEN
		mockRouter();
		const fetchMock = stubFetchQueue([RUNNING]);
		renderLiveScan();

		// WHEN
		await advanceTime(0);

		// THEN
		expect(callsWithMethod(fetchMock, "GET")).toBe(1);
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
		await advancePolls(MAX_TRANSIENT_POLL_RETRIES);

		// THEN
		expect(result.current.pollError).toEqual(WORKER_DOWN_ERROR);
	});

	it("stops polling after an error that retrying cannot fix", async () => {
		// GIVEN
		mockRouter();
		const fetchMock = stubFetchQueue([SCAN_GONE]);
		renderLiveScan();
		await advanceTime(0);

		// WHEN
		await advancePolls(2);

		// THEN
		expect(callsWithMethod(fetchMock, "GET")).toBe(1);
	});

	it("checks again right away when the user asks after polling stopped", async () => {
		// GIVEN
		mockRouter();
		const fetchMock = stubFetchQueue([SCAN_GONE]);
		const { result } = renderLiveScan();
		await advanceTime(0);

		// WHEN
		act(() => {
			result.current.retry();
		});
		await advanceTime(0);

		// THEN
		expect(callsWithMethod(fetchMock, "GET")).toBe(2);
	});
});

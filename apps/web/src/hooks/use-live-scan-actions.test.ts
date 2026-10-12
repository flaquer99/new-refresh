import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MAX_TRANSIENT_POLL_RETRIES } from "@/lib/scans/schedule-polling";
import { callsWithMethod, stubFetchQueue } from "@/testing/fetch-queue";
import { renderLiveScan } from "@/testing/live-scan-hook";
import {
	advancePolls,
	advanceTime,
	installFakeTimersPerTest,
	SCAN_GONE,
	WORKER_DOWN,
} from "@/testing/polling";
import { buildStatus } from "@/testing/report-fixtures";
import { mockRouter } from "@/testing/router";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));

const RUNNING = { body: buildStatus() };
const CANCELLED = { body: buildStatus({ status: "cancelled" }) };

installFakeTimersPerTest();

const cancelAfterFirstPoll = async (cancelResponse: { body: unknown }) => {
	stubFetchQueue([RUNNING, cancelResponse]);
	const hook = renderLiveScan();
	await advanceTime(0);
	let settled = false;
	await act(async () => {
		settled = await hook.result.current.cancel();
	});
	return { hook, settled };
};

describe("useLiveScan actions", () => {
	it("refreshes the page when the scan already finished before the cancel arrived", async () => {
		// GIVEN
		const router = mockRouter();

		// WHEN
		await cancelAfterFirstPoll(SCAN_GONE);

		// THEN
		expect(router.refresh).toHaveBeenCalledTimes(1);
	});

	it("shows no lost-contact notice when the scan already finished before the cancel arrived", async () => {
		// GIVEN
		mockRouter();

		// WHEN
		const { hook } = await cancelAfterFirstPoll(SCAN_GONE);

		// THEN
		expect(hook.result.current.pollError).toBeNull();
	});

	it("reports a cancel that the scanner could not take as unsettled", async () => {
		// GIVEN
		mockRouter();

		// WHEN
		const { settled } = await cancelAfterFirstPoll(WORKER_DOWN);

		// THEN
		expect(settled).toBe(false);
	});

	it("reports an accepted cancel as settled", async () => {
		// GIVEN
		mockRouter();

		// WHEN
		const { settled } = await cancelAfterFirstPoll(CANCELLED);

		// THEN
		expect(settled).toBe(true);
	});

	it("checks again right away when the user asks while the scanner is unreachable", async () => {
		// GIVEN
		mockRouter();
		const fetchMock = stubFetchQueue([WORKER_DOWN]);
		const { result } = renderLiveScan();
		await advancePolls(MAX_TRANSIENT_POLL_RETRIES);
		const pollsBefore = callsWithMethod(fetchMock, "GET");

		// WHEN
		act(() => {
			result.current.retry();
		});
		await advanceTime(0);

		// THEN
		expect(callsWithMethod(fetchMock, "GET")).toBe(pollsBefore + 1);
	});
});

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { reloadPage } from "@/lib/scans/reload-page";
import { callsWithMethod, stubFetchQueue } from "@/testing/fetch-queue";
import {
	advancePoll,
	advanceTime,
	installFakeTimersPerTest,
} from "@/testing/polling";
import { buildStatus } from "@/testing/report-fixtures";
import { useScanPolling } from "./use-scan-polling";

vi.mock("@/lib/scans/reload-page", () => ({ reloadPage: vi.fn() }));

const SCAN_ID = "8f0c6b8e-3a8e-4d0b-9a57-2f5a1d6f4c11";
const SIGNED_OUT = {
	body: { error: { code: "UNAUTHORIZED", message: "Sign in to continue." } },
	status: 401,
};

installFakeTimersPerTest();

describe("useScanPolling", () => {
	it("reloads the page when the status answers 401", async () => {
		// GIVEN
		stubFetchQueue([SIGNED_OUT]);
		renderHook(() => useScanPolling({ scanId: SCAN_ID, onResult: vi.fn() }));

		// WHEN
		await advanceTime(0);

		// THEN
		expect(reloadPage).toHaveBeenCalledTimes(1);
	});

	it("does not hand a 401 to the result handler", async () => {
		// GIVEN
		stubFetchQueue([SIGNED_OUT]);
		const onResult = vi.fn();
		renderHook(() => useScanPolling({ scanId: SCAN_ID, onResult }));

		// WHEN
		await advanceTime(0);

		// THEN
		expect(onResult).not.toHaveBeenCalled();
	});

	it("stops polling after a 401", async () => {
		// GIVEN
		const fetchMock = stubFetchQueue([SIGNED_OUT]);
		renderHook(() => useScanPolling({ scanId: SCAN_ID, onResult: vi.fn() }));

		// WHEN
		await advanceTime(0);
		await advancePoll();

		// THEN
		expect(callsWithMethod(fetchMock, "GET")).toBe(1);
	});

	it("hands a running status to the result handler without reloading", async () => {
		// GIVEN
		stubFetchQueue([{ body: buildStatus() }]);
		const onResult = vi.fn();
		renderHook(() => useScanPolling({ scanId: SCAN_ID, onResult }));

		// WHEN
		await advanceTime(0);

		// THEN
		expect([
			onResult.mock.calls.length,
			vi.mocked(reloadPage).mock.calls.length,
		]).toEqual([1, 0]);
	});
});

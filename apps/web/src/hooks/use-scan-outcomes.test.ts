import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { callsWithMethod, stubFetchQueue } from "@/testing/fetch-queue";
import {
	advancePoll,
	CREATED,
	installFakeTimersPerTest,
} from "@/testing/polling";
import { buildReport, buildStatus } from "@/testing/report-fixtures";
import { startScanHook } from "@/testing/start-scan-hook";

const CANCELLED_REPORT = buildReport({ outcome: "cancelled" });
const CANCEL_FLOW = [
	CREATED,
	{ body: buildStatus(), status: 202 },
	{ body: buildStatus({ status: "cancelled", report: CANCELLED_REPORT }) },
];

installFakeTimersPerTest();

describe("useScan outcomes", () => {
	it("sends a single DELETE when cancelling", async () => {
		// GIVEN
		const fetchMock = stubFetchQueue(CANCEL_FLOW);
		const { result } = await startScanHook();

		// WHEN
		await act(async () => {
			await result.current.cancel();
		});

		// THEN
		expect(callsWithMethod(fetchMock, "DELETE")).toBe(1);
	});

	it("finishes with the partial report after cancelling", async () => {
		// GIVEN
		stubFetchQueue(CANCEL_FLOW);
		const { result } = await startScanHook();
		await act(async () => {
			await result.current.cancel();
		});

		// WHEN
		await advancePoll();

		// THEN
		expect(result.current.state).toEqual({
			phase: "finished",
			report: CANCELLED_REPORT,
		});
	});

	it("fails when the scan request is rejected", async () => {
		// GIVEN
		const error = {
			code: "URL_NOT_ALLOWED",
			message: "Private address.",
		} as const;
		stubFetchQueue([{ body: { error }, status: 422 }]);

		// WHEN
		const { result } = await startScanHook();

		// THEN
		expect(result.current.state).toEqual({ phase: "failed", error });
	});

	it("fails when a poll returns an error", async () => {
		// GIVEN
		const error = {
			code: "SCAN_NOT_FOUND",
			message: "This scan no longer exists.",
		} as const;
		stubFetchQueue([CREATED, { body: { error }, status: 404 }]);
		const { result } = await startScanHook();

		// WHEN
		await advancePoll();

		// THEN
		expect(result.current.state).toEqual({ phase: "failed", error });
	});
});

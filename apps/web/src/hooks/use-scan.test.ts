import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { callsWithMethod, stubFetchQueue } from "@/testing/fetch-queue";
import { START_URL } from "@/testing/finding-fixtures";
import {
	advancePoll,
	CREATED,
	installFakeTimersPerTest,
} from "@/testing/polling";
import { buildReport, buildStatus } from "@/testing/report-fixtures";
import { startScanHook } from "@/testing/start-scan-hook";

const PROGRESS = {
	pagesScanned: 2,
	pagesDiscovered: 5,
	currentUrl: `${START_URL}about`,
};

installFakeTimersPerTest();

describe("useScan", () => {
	it("enters the running phase once the scan is accepted", async () => {
		// GIVEN
		stubFetchQueue([CREATED]);

		// WHEN
		const { result } = await startScanHook();

		// THEN
		expect(result.current.state).toMatchObject({
			phase: "running",
			scanId: "scan-1",
		});
	});

	it("updates the progress on each poll interval", async () => {
		// GIVEN
		stubFetchQueue([CREATED, { body: buildStatus({ progress: PROGRESS }) }]);
		const { result } = await startScanHook();

		// WHEN
		await advancePoll();

		// THEN
		expect(result.current.state).toMatchObject({
			phase: "running",
			progress: PROGRESS,
		});
	});

	it("stops polling once the scan reaches a terminal status", async () => {
		// GIVEN
		const report = buildReport();
		const fetchMock = stubFetchQueue([
			CREATED,
			{ body: buildStatus({ progress: PROGRESS }) },
			{ body: buildStatus({ status: "completed", report }) },
		]);
		const { result } = await startScanHook();

		// WHEN
		await advancePoll();
		await advancePoll();
		await advancePoll();
		await advancePoll();

		// THEN
		expect(result.current.state).toEqual({ phase: "finished", report });
		expect(callsWithMethod(fetchMock, "GET")).toBe(2);
	});

	it("returns to the idle phase on reset", async () => {
		// GIVEN
		stubFetchQueue([CREATED]);
		const { result } = await startScanHook();

		// WHEN
		act(() => {
			result.current.reset();
		});

		// THEN
		expect(result.current.state).toEqual({ phase: "idle" });
	});
});

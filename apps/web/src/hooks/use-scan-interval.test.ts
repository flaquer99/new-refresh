import { POLL_INTERVAL_MS } from "@refresh/scan-contracts/limits";
import { describe, expect, it } from "vitest";
import { callsWithMethod, stubFetchQueue } from "@/testing/fetch-queue";
import {
	advanceTime,
	CREATED,
	installFakeTimersPerTest,
} from "@/testing/polling";
import { buildStatus } from "@/testing/report-fixtures";
import { startScanHook } from "@/testing/start-scan-hook";

const JUST_BEFORE_INTERVAL_MS = POLL_INTERVAL_MS - 1;
const RUNNING = { body: buildStatus() };

installFakeTimersPerTest();

describe("useScan poll interval", () => {
	it("does not poll before the 2 s interval has elapsed", async () => {
		// GIVEN
		const fetchMock = stubFetchQueue([CREATED, RUNNING]);
		await startScanHook();

		// WHEN
		await advanceTime(JUST_BEFORE_INTERVAL_MS);

		// THEN
		expect(callsWithMethod(fetchMock, "GET")).toBe(0);
	});

	it("polls exactly once when the 2 s interval elapses", async () => {
		// GIVEN
		const fetchMock = stubFetchQueue([CREATED, RUNNING]);
		await startScanHook();

		// WHEN
		await advanceTime(POLL_INTERVAL_MS);

		// THEN
		expect(callsWithMethod(fetchMock, "GET")).toBe(1);
	});

	it("waits another full interval before the next poll", async () => {
		// GIVEN
		const fetchMock = stubFetchQueue([CREATED, RUNNING]);
		await startScanHook();
		await advanceTime(POLL_INTERVAL_MS);

		// WHEN
		await advanceTime(JUST_BEFORE_INTERVAL_MS);

		// THEN
		expect(callsWithMethod(fetchMock, "GET")).toBe(1);
	});
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deleteScanAction } from "@/app/scans/actions";
import { closeScanStore } from "@/server/db/scan-store";
import {
	COMPLETED_RESULT,
	useCallbackToken,
} from "@/testing/callback-requests";
import {
	deliverResult,
	readScan,
	startStoredScan,
} from "@/testing/scan-journey";
import { SCAN_ID } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { stubWorker } from "@/testing/stub-worker";
import { useTestDatabase } from "@/testing/use-test-database";

vi.mock("next/cache", () => ({ refresh: vi.fn() }));

const STARTED_AT = new Date("2026-10-09T10:00:00.000Z");
const PAST_STALE_LIMIT = new Date("2026-10-09T10:13:00.000Z");

describe("scan persistence with a real database", () => {
	useTestDatabase();
	useCallbackToken();

	beforeEach(() => {
		vi.useFakeTimers({ toFake: ["Date"] });
		vi.setSystemTime(STARTED_AT);
		vi.spyOn(crypto, "randomUUID").mockReturnValue(SCAN_ID);
		spyOnServerLog();
		stubWorker(201, { scanId: SCAN_ID });
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("serves a delivered report unchanged after the store restarts", async () => {
		// GIVEN
		await startStoredScan();
		await deliverResult();
		await closeScanStore();

		// WHEN
		const scan = await readScan();

		// THEN
		expect(scan.body).toMatchObject({
			status: "completed",
			report: COMPLETED_RESULT.report,
		});
	});

	it("ignores a result that arrives after the scan was settled as interrupted", async () => {
		// GIVEN
		await startStoredScan();
		vi.setSystemTime(PAST_STALE_LIMIT);
		await readScan();

		// WHEN
		const response = await deliverResult();

		// THEN
		expect(await response.json()).toEqual({ recorded: false });
	});

	it("keeps an interrupted scan failed when a late result arrives", async () => {
		// GIVEN
		await startStoredScan();
		vi.setSystemTime(PAST_STALE_LIMIT);
		await readScan();
		await deliverResult();

		// WHEN
		const scan = await readScan();

		// THEN
		expect(scan.body).toMatchObject({
			status: "failed",
			error: { code: "SCAN_INTERRUPTED" },
		});
	});

	it("answers 404 for a scan deleted from the history", async () => {
		// GIVEN
		await startStoredScan();
		await deliverResult();
		await deleteScanAction(SCAN_ID, null);

		// WHEN
		const scan = await readScan();

		// THEN
		expect(scan.status).toBe(404);
	});
});

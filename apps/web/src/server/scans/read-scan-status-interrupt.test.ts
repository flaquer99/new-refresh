import { SCAN_INTERRUPTED_MESSAGE } from "@refresh/scan-contracts/errors";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { RUNNING_STATUS, SCAN_ID } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { buildStoredScan, RUNNING_STORED_SCAN } from "@/testing/stored-scans";
import { stubWorker } from "@/testing/stub-worker";
import { readScanStatus } from "./read-scan-status";

vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

const NOW = new Date("2026-10-09T12:00:00.000Z");
const TWELVE_MINUTES_AGO = new Date("2026-10-09T11:48:00.000Z");
const INTERRUPTED = buildStoredScan({
	status: "failed",
	report: null,
	error: { code: "SCAN_INTERRUPTED", message: SCAN_INTERRUPTED_MESSAGE },
});

describe("readScanStatus interruptions", () => {
	const store = useFakeScanStore();

	beforeEach(() => {
		vi.useFakeTimers({ toFake: ["Date"] });
		vi.setSystemTime(NOW);
		spyOnServerLog();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("marks a running scan interrupted when the worker no longer knows it", async () => {
		// GIVEN
		store()
			.get.mockResolvedValueOnce(RUNNING_STORED_SCAN)
			.mockResolvedValue(INTERRUPTED);
		stubWorker(404, { error: { code: "SCAN_NOT_FOUND", message: "Gone." } });

		// WHEN
		await readScanStatus({ scanId: SCAN_ID, clientId: "c" });

		// THEN
		expect(store().markInterrupted).toHaveBeenCalledWith(SCAN_ID, NOW);
	});

	it("returns the interrupted failure after a worker 404", async () => {
		// GIVEN
		store()
			.get.mockResolvedValueOnce(RUNNING_STORED_SCAN)
			.mockResolvedValue(INTERRUPTED);
		stubWorker(404, { error: { code: "SCAN_NOT_FOUND", message: "Gone." } });

		// WHEN
		const response = await readScanStatus({ scanId: SCAN_ID, clientId: "c" });

		// THEN
		expect(await response.json()).toMatchObject({
			status: "failed",
			error: { code: "SCAN_INTERRUPTED" },
		});
	});

	it("settles scans running for more than 12 minutes before reading", async () => {
		// GIVEN
		store().get.mockResolvedValue(buildStoredScan());
		stubWorker(200, RUNNING_STATUS);

		// WHEN
		await readScanStatus({ scanId: SCAN_ID, clientId: "c" });

		// THEN
		expect(store().settleStale).toHaveBeenCalledWith(TWELVE_MINUTES_AGO, NOW);
	});

	it("answers 404 for an id that is not a uuid without touching the store", async () => {
		// GIVEN
		stubWorker(200, RUNNING_STATUS);

		// WHEN
		const response = await readScanStatus({ scanId: "scan-1", clientId: "c" });

		// THEN
		expect([response.status, store().get.mock.calls.length]).toEqual([404, 0]);
	});

	it("answers 404 SCAN_NOT_FOUND for an unknown scan", async () => {
		// GIVEN
		stubWorker(200, RUNNING_STATUS);

		// WHEN
		const response = await readScanStatus({ scanId: SCAN_ID, clientId: "c" });

		// THEN
		expect((await response.json()).error.code).toBe("SCAN_NOT_FOUND");
	});
});

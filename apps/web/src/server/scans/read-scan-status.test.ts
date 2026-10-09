import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	buildStoredScan,
	RUNNING_STORED_SCAN,
	useFakeScanStore,
} from "@/testing/fake-scan-store";
import { buildReport } from "@/testing/report-fixtures";
import { RUNNING_STATUS, SCAN_ID } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { stubWorker } from "@/testing/stub-worker";
import { readScanStatus } from "./read-scan-status";

vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

const READ = { scanId: SCAN_ID, clientId: "198.51.100.4" };

describe("readScanStatus", () => {
	const store = useFakeScanStore();

	beforeEach(() => {
		spyOnServerLog();
	});

	it("answers a finished scan from the store without calling the worker", async () => {
		// GIVEN
		store().get.mockResolvedValue(buildStoredScan());
		const calls = stubWorker(200, RUNNING_STATUS);

		// WHEN
		const response = await readScanStatus(READ);

		// THEN
		expect([(await response.json()).status, calls.length]).toEqual([
			"completed",
			0,
		]);
	});

	it("returns the stored report of a finished scan", async () => {
		// GIVEN
		const report = buildReport({ outcome: "page-limit-reached" });
		store().get.mockResolvedValue(buildStoredScan({ report }));
		stubWorker(200, RUNNING_STATUS);

		// WHEN
		const response = await readScanStatus(READ);

		// THEN
		expect((await response.json()).report).toEqual(report);
	});

	it("returns the worker's live progress for a running scan", async () => {
		// GIVEN
		store().get.mockResolvedValue(RUNNING_STORED_SCAN);
		stubWorker(200, RUNNING_STATUS);

		// WHEN
		const response = await readScanStatus(READ);

		// THEN
		expect(await response.json()).toEqual(RUNNING_STATUS);
	});

	it("records a terminal worker status before returning it", async () => {
		// GIVEN
		store().get.mockResolvedValue(RUNNING_STORED_SCAN);
		const report = buildReport();
		stubWorker(200, { ...RUNNING_STATUS, status: "completed", report });

		// WHEN
		await readScanStatus(READ);

		// THEN
		expect(store().recordResult).toHaveBeenCalledWith(
			expect.objectContaining({ scanId: SCAN_ID, status: "completed", report }),
		);
	});
});

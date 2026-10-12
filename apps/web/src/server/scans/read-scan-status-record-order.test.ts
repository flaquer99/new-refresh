import type { RecordOutcome } from "@refresh/db/scan-store-types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { buildReport } from "@/testing/report-fixtures";
import { RUNNING_STATUS, SCAN_ID } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { RUNNING_STORED_SCAN } from "@/testing/stored-scans";
import { stubWorker } from "@/testing/stub-worker";
import { readScanStatus } from "./read-scan-status";

vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

const READ = { scanId: SCAN_ID, clientId: "198.51.100.4" };

describe("readScanStatus recording order", () => {
	const store = useFakeScanStore();

	beforeEach(() => {
		spyOnServerLog();
	});

	it("does not answer before the terminal worker status is recorded", async () => {
		// GIVEN
		store().get.mockResolvedValue(RUNNING_STORED_SCAN);
		const recording = Promise.withResolvers<RecordOutcome>();
		store().recordResult.mockReturnValue(recording.promise);
		stubWorker(200, {
			...RUNNING_STATUS,
			status: "completed",
			report: buildReport(),
		});
		let answered = false;

		// WHEN
		const answer = readScanStatus(READ).then(() => {
			answered = true;
		});
		await vi.waitFor(() => {
			expect(store().recordResult).toHaveBeenCalled();
		});

		// THEN
		expect(answered).toBe(false);
		recording.resolve("recorded");
		await answer;
	});
});

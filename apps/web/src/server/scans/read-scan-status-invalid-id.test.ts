import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { RUNNING_STATUS } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { stubWorker } from "@/testing/stub-worker";
import { readScanStatus } from "./read-scan-status";

vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

const NOT_A_UUID = { scanId: "scan-1", clientId: "198.51.100.4" };

describe("readScanStatus with an id that is not a uuid", () => {
	const store = useFakeScanStore();

	beforeEach(() => {
		spyOnServerLog();
		stubWorker(200, RUNNING_STATUS);
	});

	it("answers 404", async () => {
		// WHEN
		const response = await readScanStatus(NOT_A_UUID);

		// THEN
		expect(response.status).toBe(404);
	});

	it("does not read the store", async () => {
		// WHEN
		await readScanStatus(NOT_A_UUID);

		// THEN
		expect(store().get).not.toHaveBeenCalled();
	});

	it("does not settle stale scans", async () => {
		// WHEN
		await readScanStatus(NOT_A_UUID);

		// THEN
		expect(store().settleStale).not.toHaveBeenCalled();
	});
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { RUNNING_STATUS, SCAN_ID } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { RUNNING_STORED_SCAN } from "@/testing/stored-scans";
import { stubWorker } from "@/testing/stub-worker";
import { readScanStatus } from "./read-scan-status";

vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

const READ = { scanId: SCAN_ID, clientId: "198.51.100.4" };

describe("readScanStatus with a running scan", () => {
	const store = useFakeScanStore();

	beforeEach(() => {
		spyOnServerLog();
	});

	it("does not record anything while the worker still runs the scan", async () => {
		// GIVEN
		store().get.mockResolvedValue(RUNNING_STORED_SCAN);
		stubWorker(200, RUNNING_STATUS);

		// WHEN
		await readScanStatus(READ);

		// THEN
		expect(store().recordResult).not.toHaveBeenCalled();
	});

	it("relays a worker outage for a running scan", async () => {
		// GIVEN
		store().get.mockResolvedValue(RUNNING_STORED_SCAN);
		stubWorker(502, {
			error: { code: "WORKER_UNAVAILABLE", message: "Down." },
		});

		// WHEN
		const response = await readScanStatus(READ);

		// THEN
		expect(response.status).toBe(502);
	});
});

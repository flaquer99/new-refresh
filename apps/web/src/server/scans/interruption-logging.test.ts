import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	createFakeScanStore,
	useFakeScanStore,
} from "@/testing/fake-scan-store";
import { MEMBER_ACTOR } from "@/testing/scan-actors";
import { SCAN_ID } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { RUNNING_STORED_SCAN } from "@/testing/stored-scans";
import { stubWorker } from "@/testing/stub-worker";
import { readScanStatus } from "./read-scan-status";
import { settleStaleScans } from "./stale-scans";

vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

const NOW = new Date("2026-10-09T12:00:00.000Z");

describe("interruption logging", () => {
	const store = useFakeScanStore();
	let serverLog: ReturnType<typeof spyOnServerLog>;

	beforeEach(() => {
		vi.useFakeTimers({ toFake: ["Date"] });
		vi.setSystemTime(NOW);
		serverLog = spyOnServerLog();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("logs stale scans settled as interrupted with their count", async () => {
		// GIVEN
		const staleStore = createFakeScanStore();
		staleStore.settleStale.mockResolvedValue(3);

		// WHEN
		await settleStaleScans(staleStore);

		// THEN
		expect(serverLog()).toContainEqual(
			expect.objectContaining({
				event: "scan.interrupted",
				reason: "stale",
				count: 3,
			}),
		);
	});

	it("logs nothing when no stale scan was settled", async () => {
		// GIVEN
		const staleStore = createFakeScanStore();
		staleStore.settleStale.mockResolvedValue(0);

		// WHEN
		await settleStaleScans(staleStore);

		// THEN
		expect(serverLog()).toEqual([]);
	});

	it("logs a scan the worker no longer knows as interrupted by a worker 404", async () => {
		// GIVEN
		store().get.mockResolvedValue(RUNNING_STORED_SCAN);
		store().markInterrupted.mockResolvedValue(true);
		stubWorker(404, { error: { code: "SCAN_NOT_FOUND", message: "Gone." } });

		// WHEN
		await readScanStatus({ scanId: SCAN_ID, actor: MEMBER_ACTOR });

		// THEN
		expect(serverLog()).toContainEqual(
			expect.objectContaining({
				event: "scan.interrupted",
				scanId: SCAN_ID,
				reason: "worker-404",
			}),
		);
	});
});

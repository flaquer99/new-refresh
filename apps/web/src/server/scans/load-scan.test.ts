import { connection } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { SCAN_ID } from "@/testing/scan-route-requests";
import { buildStoredScan } from "@/testing/stored-scans";
import { loadHistory } from "./load-history";
import { loadScan } from "./load-scan";

vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));
vi.mock("next/server", () => ({ connection: vi.fn(() => Promise.resolve()) }));

describe("loadScan", () => {
	const store = useFakeScanStore();

	it("reads the scan per request after settling stale scans", async () => {
		// GIVEN
		store().get.mockResolvedValue(buildStoredScan());

		// WHEN
		const scan = await loadScan(SCAN_ID);

		// THEN
		expect([
			scan?.status,
			vi.mocked(connection).mock.calls.length > 0,
			store().settleStale.mock.calls.length,
		]).toEqual(["completed", true, 1]);
	});

	it("returns null for an id that is not a uuid without reading the store", async () => {
		// WHEN
		const scan = await loadScan("not-a-scan");

		// THEN
		expect([scan, store().get.mock.calls.length]).toEqual([null, 0]);
	});
});

describe("loadHistory", () => {
	const store = useFakeScanStore();

	it("lists 20 scans before the given cursor", async () => {
		// WHEN
		await loadHistory("cursor");

		// THEN
		expect(store().list).toHaveBeenCalledWith({ before: "cursor", limit: 20 });
	});

	it("settles stale scans before listing", async () => {
		// WHEN
		await loadHistory(null);

		// THEN
		expect(store().settleStale).toHaveBeenCalledTimes(1);
	});
});

import { connection } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { SCAN_ID } from "@/testing/scan-route-requests";
import { buildStoredScan } from "@/testing/stored-scans";
import { useFakeClerk } from "@/testing/use-fake-clerk";
import { loadScan } from "./load-scan";

vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(),
	currentUser: vi.fn(),
}));
vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));
vi.mock("next/server", () => ({ connection: vi.fn(() => Promise.resolve()) }));

describe("loadScan", () => {
	useFakeClerk();
	const store = useFakeScanStore();

	it("returns the stored scan", async () => {
		// GIVEN
		store().get.mockResolvedValue(buildStoredScan());

		// WHEN
		const scan = await loadScan(SCAN_ID);

		// THEN
		expect(scan?.scan.status).toBe("completed");
	});

	it("reads the scan per request instead of at build time", async () => {
		// GIVEN
		store().get.mockResolvedValue(buildStoredScan());

		// WHEN
		await loadScan(SCAN_ID);

		// THEN
		expect(connection).toHaveBeenCalled();
	});

	it("settles stale scans before reading the scan", async () => {
		// GIVEN
		store().get.mockResolvedValue(buildStoredScan());

		// WHEN
		await loadScan(SCAN_ID);

		// THEN
		expect(store().settleStale).toHaveBeenCalledTimes(1);
	});

	it("returns null for an id that is not a uuid", async () => {
		// WHEN
		const scan = await loadScan("not-a-scan");

		// THEN
		expect(scan).toBeNull();
	});

	it("does not read the store for an id that is not a uuid", async () => {
		// WHEN
		await loadScan("not-a-scan");

		// THEN
		expect(store().get).not.toHaveBeenCalled();
	});
});

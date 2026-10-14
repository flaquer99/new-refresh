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

describe("loadScan scope", () => {
	useFakeClerk();
	const store = useFakeScanStore();

	it("looks the scan up in the actor's organization", async () => {
		// GIVEN
		store().get.mockResolvedValue(buildStoredScan());

		// WHEN
		await loadScan(SCAN_ID);

		// THEN
		expect(store().get).toHaveBeenCalledWith({
			scanId: SCAN_ID,
			organizationId: "org_test",
		});
	});

	it("returns null for a scan of another organization", async () => {
		// GIVEN
		store().get.mockResolvedValue(null);

		// WHEN
		const scan = await loadScan(SCAN_ID);

		// THEN
		expect(scan).toBeNull();
	});

	it("lets a member manage their own scan", async () => {
		// GIVEN
		store().get.mockResolvedValue(buildStoredScan());

		// WHEN
		const scan = await loadScan(SCAN_ID);

		// THEN
		expect(scan?.canManage).toBe(true);
	});

	it("does not let a member manage another member's scan", async () => {
		// GIVEN
		store().get.mockResolvedValue(
			buildStoredScan({ startedByUserId: "user_other" }),
		);

		// WHEN
		const scan = await loadScan(SCAN_ID);

		// THEN
		expect(scan?.canManage).toBe(false);
	});
});

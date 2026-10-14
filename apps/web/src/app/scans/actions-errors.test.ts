import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { SCAN_ID } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { buildStoredScan } from "@/testing/stored-scans";
import { useFakeClerk } from "@/testing/use-fake-clerk";
import { deleteScanAction } from "./actions";

vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(),
	currentUser: vi.fn(),
}));
vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));
vi.mock("next/cache", () => ({ refresh: vi.fn() }));

describe("deleteScanAction errors", () => {
	useFakeClerk();
	const store = useFakeScanStore();

	beforeEach(() => {
		store().get.mockResolvedValue(buildStoredScan());
		spyOnServerLog();
	});

	it("reports a scan that no longer exists", async () => {
		// GIVEN
		store().deleteFinished.mockResolvedValue("not-found");

		// WHEN
		const result = await deleteScanAction(SCAN_ID);

		// THEN
		expect(result).toMatchObject({
			ok: false,
			error: { code: "SCAN_NOT_FOUND" },
		});
	});

	it("reports INTERNAL_ERROR when the database is down", async () => {
		// GIVEN
		store().deleteFinished.mockRejectedValue(new Error("Connection refused"));

		// WHEN
		const result = await deleteScanAction(SCAN_ID);

		// THEN
		expect(result).toMatchObject({
			ok: false,
			error: { code: "INTERNAL_ERROR" },
		});
	});

	it("reports a scan of another organization as not found", async () => {
		// GIVEN
		store().get.mockResolvedValue(null);

		// WHEN
		const result = await deleteScanAction(SCAN_ID);

		// THEN
		expect([result, store().deleteFinished.mock.calls.length]).toEqual([
			{
				ok: false,
				error: {
					code: "SCAN_NOT_FOUND",
					message: "This scan doesn't exist. It may have been deleted.",
				},
			},
			0,
		]);
	});
});

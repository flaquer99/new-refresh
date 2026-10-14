import { refresh } from "next/cache";
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

describe("deleteScanAction", () => {
	useFakeClerk();
	const store = useFakeScanStore();

	beforeEach(() => {
		store().get.mockResolvedValue(buildStoredScan());
		spyOnServerLog();
	});

	it("deletes a finished scan", async () => {
		// WHEN
		const result = await deleteScanAction(SCAN_ID);

		// THEN
		expect([result, store().deleteFinished.mock.calls]).toEqual([
			{ ok: true },
			[[{ scanId: SCAN_ID, organizationId: "org_test" }]],
		]);
	});

	it("refreshes the history after a deletion", async () => {
		// WHEN
		await deleteScanAction(SCAN_ID);

		// THEN
		expect(refresh).toHaveBeenCalledTimes(1);
	});

	it("refuses to delete a running scan", async () => {
		// GIVEN
		store().deleteFinished.mockResolvedValue("running");

		// WHEN
		const result = await deleteScanAction(SCAN_ID);

		// THEN
		expect(result).toEqual({
			ok: false,
			error: {
				code: "SCAN_STILL_RUNNING",
				message:
					"This scan is still running. Cancel it and wait for it to finish before deleting it.",
			},
		});
	});

	it("does not refresh when the deletion is refused", async () => {
		// GIVEN
		store().deleteFinished.mockResolvedValue("running");

		// WHEN
		await deleteScanAction(SCAN_ID);

		// THEN
		expect(refresh).not.toHaveBeenCalled();
	});
});

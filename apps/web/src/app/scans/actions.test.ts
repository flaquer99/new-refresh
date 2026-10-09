import { refresh } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { SCAN_ID } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { deleteScanAction } from "./actions";

vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));
vi.mock("next/cache", () => ({ refresh: vi.fn() }));

describe("deleteScanAction", () => {
	const store = useFakeScanStore();

	beforeEach(() => {
		spyOnServerLog();
	});

	it("deletes a finished scan", async () => {
		// WHEN
		const result = await deleteScanAction(SCAN_ID, null);

		// THEN
		expect([result, store().deleteFinished.mock.calls]).toEqual([
			{ ok: true },
			[[SCAN_ID]],
		]);
	});

	it("refreshes the history after a deletion", async () => {
		// WHEN
		await deleteScanAction(SCAN_ID, null);

		// THEN
		expect(refresh).toHaveBeenCalledTimes(1);
	});

	it("refuses to delete a running scan", async () => {
		// GIVEN
		store().deleteFinished.mockResolvedValue("running");

		// WHEN
		const result = await deleteScanAction(SCAN_ID, null);

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
		await deleteScanAction(SCAN_ID, null);

		// THEN
		expect(refresh).not.toHaveBeenCalled();
	});

	it("reports a scan that no longer exists", async () => {
		// GIVEN
		store().deleteFinished.mockResolvedValue("not-found");

		// WHEN
		const result = await deleteScanAction(SCAN_ID, null);

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
		const result = await deleteScanAction(SCAN_ID, null);

		// THEN
		expect(result).toMatchObject({
			ok: false,
			error: { code: "INTERNAL_ERROR" },
		});
	});
});

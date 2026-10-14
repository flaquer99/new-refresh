import { refresh } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeClerkStates } from "@/testing/fake-clerk";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { SCAN_ID } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { buildStoredScan } from "@/testing/stored-scans";
import { signInAs, useFakeClerk } from "@/testing/use-fake-clerk";
import { deleteScanAction } from "./actions";

vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(),
	currentUser: vi.fn(),
}));
vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));
vi.mock("next/cache", () => ({ refresh: vi.fn() }));

describe("deleteScanAction permissions", () => {
	useFakeClerk();
	const store = useFakeScanStore();

	beforeEach(() => {
		store().get.mockResolvedValue(buildStoredScan());
		spyOnServerLog();
	});

	it("refuses a member deleting another member's scan", async () => {
		// GIVEN
		store().get.mockResolvedValue(
			buildStoredScan({ startedByUserId: "user_other" }),
		);

		// WHEN
		const result = await deleteScanAction(SCAN_ID);

		// THEN
		expect([result, store().deleteFinished.mock.calls.length]).toEqual([
			{
				ok: false,
				error: {
					code: "FORBIDDEN",
					message: "Only admins can delete scans started by someone else.",
				},
			},
			0,
		]);
	});

	it("lets an admin delete any finished scan", async () => {
		// GIVEN
		signInAs(fakeClerkStates.admin);
		store().get.mockResolvedValue(
			buildStoredScan({ startedByUserId: "user_other" }),
		);

		// WHEN
		const result = await deleteScanAction(SCAN_ID);

		// THEN
		expect([result, vi.mocked(refresh).mock.calls.length]).toEqual([
			{ ok: true },
			1,
		]);
	});

	it("refuses signed-out callers without touching the store", async () => {
		// GIVEN
		signInAs(fakeClerkStates.signedOut);

		// WHEN
		const result = await deleteScanAction(SCAN_ID);

		// THEN
		expect([result, store().get.mock.calls.length]).toEqual([
			{
				ok: false,
				error: { code: "UNAUTHORIZED", message: "Sign in to continue." },
			},
			0,
		]);
	});

	it("refuses callers without an active organization", async () => {
		// GIVEN
		signInAs(fakeClerkStates.pending);

		// WHEN
		const result = await deleteScanAction(SCAN_ID);

		// THEN
		expect(result).toMatchObject({
			ok: false,
			error: { code: "ORGANIZATION_REQUIRED" },
		});
	});
});

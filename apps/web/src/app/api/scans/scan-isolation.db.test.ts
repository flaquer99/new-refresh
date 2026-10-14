import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteScanAction } from "@/app/scans/actions";
import { loadHistory } from "@/server/scans/load-history";
import { useCallbackToken } from "@/testing/callback-requests";
import { fakeClerkStates } from "@/testing/fake-clerk";
import {
	deliverResult,
	readScan,
	startStoredScan,
} from "@/testing/scan-journey";
import { SCAN_ID } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { stubWorker } from "@/testing/stub-worker";
import { signInAs, useFakeClerk } from "@/testing/use-fake-clerk";
import { useTestDatabase } from "@/testing/use-test-database";

vi.mock("next/cache", () => ({ refresh: vi.fn() }));
vi.mock("next/server", () => ({ connection: vi.fn(() => Promise.resolve()) }));
vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(),
	currentUser: vi.fn(),
}));

describe("scan isolation with a real database", () => {
	useTestDatabase();
	useFakeClerk();
	useCallbackToken();

	beforeEach(() => {
		vi.spyOn(crypto, "randomUUID").mockReturnValue(SCAN_ID);
		spyOnServerLog();
		stubWorker(201, { scanId: SCAN_ID });
	});

	it("answers 404 to the status route for another organization's scan", async () => {
		// GIVEN
		await startStoredScan();
		await deliverResult();
		signInAs(fakeClerkStates.outsiderAdmin);

		// WHEN
		const scan = await readScan();

		// THEN
		expect(scan.status).toBe(404);
	});

	it("refuses another organization's admin deleting the scan and keeps the row", async () => {
		// GIVEN
		await startStoredScan();
		await deliverResult();
		signInAs(fakeClerkStates.outsiderAdmin);

		// WHEN
		const result = await deleteScanAction(SCAN_ID);

		// THEN
		expect(result).toMatchObject({
			ok: false,
			error: { code: "SCAN_NOT_FOUND" },
		});
	});

	it("still serves the scan to its own organization after a refused delete", async () => {
		// GIVEN
		await startStoredScan();
		await deliverResult();
		signInAs(fakeClerkStates.outsiderAdmin);
		await deleteScanAction(SCAN_ID);
		signInAs({
			kind: "member",
			userId: "user_test",
			organizationId: "org_test",
		});

		// WHEN
		const scan = await readScan();

		// THEN
		expect(scan.status).toBe(200);
	});

	it("hides another organization's scans from the history", async () => {
		// GIVEN
		await startStoredScan();
		await deliverResult();
		signInAs(fakeClerkStates.outsiderAdmin);

		// WHEN
		const page = await loadHistory(null);

		// THEN
		expect(page.entries).toEqual([]);
	});
});

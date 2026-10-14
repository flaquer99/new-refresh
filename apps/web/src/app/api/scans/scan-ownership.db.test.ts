import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadHistory } from "@/server/scans/load-history";
import { useCallbackToken } from "@/testing/callback-requests";
import { deliverResult, startStoredScan } from "@/testing/scan-journey";
import { SCAN_ID } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { stubWorker } from "@/testing/stub-worker";
import { STARTER_NAME, useFakeClerk } from "@/testing/use-fake-clerk";
import { useTestDatabase } from "@/testing/use-test-database";

vi.mock("next/cache", () => ({ refresh: vi.fn() }));
vi.mock("next/server", () => ({ connection: vi.fn(() => Promise.resolve()) }));
vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(),
	currentUser: vi.fn(),
}));

describe("scan ownership with a real database", () => {
	useTestDatabase();
	useFakeClerk();
	useCallbackToken();

	beforeEach(() => {
		vi.spyOn(crypto, "randomUUID").mockReturnValue(SCAN_ID);
		spyOnServerLog();
		stubWorker(201, { scanId: SCAN_ID });
	});

	it("keeps the owner and the final status through start, callback, and history", async () => {
		// GIVEN
		await startStoredScan();
		await deliverResult();

		// WHEN
		const page = await loadHistory(null);

		// THEN
		expect(page.entries).toMatchObject([
			{
				scanId: SCAN_ID,
				status: "completed",
				startedByName: STARTER_NAME,
				canDelete: true,
			},
		]);
	});
});

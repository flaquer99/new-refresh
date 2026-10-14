import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deleteScanAction } from "@/app/scans/actions";
import { useCallbackToken } from "@/testing/callback-requests";
import {
	deliverResult,
	readScan,
	startStoredScan,
} from "@/testing/scan-journey";
import { SCAN_ID } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { stubWorker } from "@/testing/stub-worker";
import { useFakeClerk } from "@/testing/use-fake-clerk";
import { useTestDatabase } from "@/testing/use-test-database";

vi.mock("next/cache", () => ({ refresh: vi.fn() }));
vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(),
	currentUser: vi.fn(),
}));

const STARTED_AT = new Date("2026-10-09T10:00:00.000Z");
describe("scan persistence with a real database deletion", () => {
	useTestDatabase();
	useFakeClerk();
	useCallbackToken();

	beforeEach(() => {
		vi.useFakeTimers({ toFake: ["Date"] });
		vi.setSystemTime(STARTED_AT);
		vi.spyOn(crypto, "randomUUID").mockReturnValue(SCAN_ID);
		spyOnServerLog();
		stubWorker(201, { scanId: SCAN_ID });
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("answers 404 for a scan deleted from the history", async () => {
		// GIVEN
		await startStoredScan();
		await deliverResult();
		await deleteScanAction(SCAN_ID);

		// WHEN
		const scan = await readScan();

		// THEN
		expect(scan.status).toBe(404);
	});
});

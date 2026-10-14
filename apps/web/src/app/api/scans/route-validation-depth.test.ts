import { INVALID_DEPTH_MESSAGE } from "@refresh/scan-contracts/scan-request";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { SCAN_ID, startScanRequest } from "@/testing/scan-route-requests";
import { stubWorker } from "@/testing/stub-worker";
import { useFakeClerk } from "@/testing/use-fake-clerk";
import { POST } from "./route";

vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(),
	currentUser: vi.fn(),
}));
vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

describe("POST /api/scans validation depth", () => {
	useFakeClerk();
	useFakeScanStore();

	beforeEach(() => {
		vi.spyOn(crypto, "randomUUID").mockReturnValue(SCAN_ID);
	});

	it("rejects an out-of-range depth with the depth message", async () => {
		// GIVEN
		stubWorker(201, { scanId: SCAN_ID });

		// WHEN
		const response = await POST(
			startScanRequest({ url: "https://www.example.org/", depth: 4 }),
		);

		// THEN
		expect((await response.json()).error.message).toBe(INVALID_DEPTH_MESSAGE);
	});

	it("does not call the worker when the request is invalid", async () => {
		// GIVEN
		const calls = stubWorker(201, { scanId: SCAN_ID });

		// WHEN
		await POST(startScanRequest({ url: "https://www.example.org/", depth: 4 }));

		// THEN
		expect(calls).toEqual([]);
	});
});

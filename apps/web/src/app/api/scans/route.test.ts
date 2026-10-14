import { beforeEach, describe, expect, it, vi } from "vitest";
import { TEST_USER_ID } from "@/testing/fake-clerk";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import {
	SCAN_ID,
	startScanRequest,
	VALID_SCAN_BODY,
} from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import {
	STUB_WORKER_TOKEN,
	STUB_WORKER_URL,
	stubWorker,
} from "@/testing/stub-worker";
import { useFakeClerk } from "@/testing/use-fake-clerk";
import { POST } from "./route";

vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(),
	currentUser: vi.fn(),
}));
vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

describe("POST /api/scans", () => {
	useFakeClerk();
	useFakeScanStore();

	beforeEach(() => {
		vi.spyOn(crypto, "randomUUID").mockReturnValue(SCAN_ID);
		spyOnServerLog();
	});

	it("forwards the scan with its id to the worker with token and client id", async () => {
		// GIVEN
		const calls = stubWorker(201, { scanId: SCAN_ID });

		// WHEN
		await POST(startScanRequest(VALID_SCAN_BODY));

		// THEN
		expect(calls).toEqual([
			{
				url: `${STUB_WORKER_URL}/scans`,
				method: "POST",
				headers: {
					authorization: `Bearer ${STUB_WORKER_TOKEN}`,
					"content-type": "application/json",
					"x-client-id": TEST_USER_ID,
				},
				body: { scanId: SCAN_ID, ...VALID_SCAN_BODY },
			},
		]);
	});

	it("answers 201 with the scan id", async () => {
		// GIVEN
		stubWorker(201, { scanId: SCAN_ID });

		// WHEN
		const response = await POST(startScanRequest(VALID_SCAN_BODY));

		// THEN
		expect({ status: response.status, body: await response.json() }).toEqual({
			status: 201,
			body: { scanId: SCAN_ID },
		});
	});
});

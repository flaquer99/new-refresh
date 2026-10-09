import { beforeEach, describe, expect, it, vi } from "vitest";
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
import { POST } from "./route";

vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

describe("POST /api/scans", () => {
	useFakeScanStore();

	beforeEach(() => {
		vi.spyOn(crypto, "randomUUID").mockReturnValue(SCAN_ID);
		spyOnServerLog();
	});

	it("forwards the scan with its id to the worker with token and client id", async () => {
		// GIVEN
		const calls = stubWorker(201, { scanId: SCAN_ID });

		// WHEN
		await POST(
			startScanRequest(VALID_SCAN_BODY, {
				"x-forwarded-for": "203.0.113.7, 10.0.0.1",
			}),
		);

		// THEN
		expect(calls).toEqual([
			{
				url: `${STUB_WORKER_URL}/scans`,
				method: "POST",
				headers: {
					authorization: `Bearer ${STUB_WORKER_TOKEN}`,
					"content-type": "application/json",
					"x-client-id": "203.0.113.7",
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

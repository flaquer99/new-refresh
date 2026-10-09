import { describe, expect, it } from "vitest";
import {
	SCAN_ID,
	startScanRequest,
	VALID_SCAN_BODY,
} from "@/testing/scan-route-requests";
import {
	STUB_WORKER_TOKEN,
	STUB_WORKER_URL,
	stubUnreachableWorker,
	stubWorker,
} from "@/testing/stub-worker";
import { POST } from "./route";

describe("POST /api/scans", () => {
	it("forwards a valid scan request to the worker with token and client id", async () => {
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
				body: VALID_SCAN_BODY,
			},
		]);
	});

	it("returns the worker's 201 response with the scan id", async () => {
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

	it.each([
		[409, "SCAN_ALREADY_RUNNING"],
		[422, "URL_NOT_ALLOWED"],
		[503, "CAPACITY_REACHED"],
	] as const)(
		"passes the worker's %d %s error through",
		async (status, code) => {
			// GIVEN
			const workerBody = { error: { code, message: "From the worker." } };
			stubWorker(status, workerBody);

			// WHEN
			const response = await POST(startScanRequest(VALID_SCAN_BODY));

			// THEN
			expect({ status: response.status, body: await response.json() }).toEqual({
				status,
				body: workerBody,
			});
		},
	);

	it("answers 502 WORKER_UNAVAILABLE when the worker is down", async () => {
		// GIVEN
		stubUnreachableWorker();

		// WHEN
		const response = await POST(startScanRequest(VALID_SCAN_BODY));

		// THEN
		expect({
			status: response.status,
			code: (await response.json()).error.code,
		}).toEqual({
			status: 502,
			code: "WORKER_UNAVAILABLE",
		});
	});
});

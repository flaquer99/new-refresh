import { describe, expect, it } from "vitest";
import {
	RUNNING_STATUS,
	SCAN_ID,
	scanRequest,
	scanRouteContext,
} from "@/testing/scan-route-requests";
import {
	STUB_WORKER_TOKEN,
	STUB_WORKER_URL,
	stubUnreachableWorker,
	stubWorker,
} from "@/testing/stub-worker";
import { GET } from "./route";

describe("GET /api/scans/[id]", () => {
	it("polls the worker for the scan with token and client id", async () => {
		// GIVEN
		const calls = stubWorker(200, RUNNING_STATUS);

		// WHEN
		await GET(
			scanRequest("GET", { "x-real-ip": "198.51.100.4" }),
			scanRouteContext(SCAN_ID),
		);

		// THEN
		expect(calls).toEqual([
			{
				url: `${STUB_WORKER_URL}/scans/${SCAN_ID}`,
				method: "GET",
				headers: {
					authorization: `Bearer ${STUB_WORKER_TOKEN}`,
					"x-client-id": "198.51.100.4",
				},
				body: null,
			},
		]);
	});

	it("returns the worker's scan status without caching", async () => {
		// GIVEN
		stubWorker(200, RUNNING_STATUS);

		// WHEN
		const response = await GET(scanRequest("GET"), scanRouteContext(SCAN_ID));

		// THEN
		expect({
			status: response.status,
			cacheControl: response.headers.get("cache-control"),
			body: await response.json(),
		}).toEqual({ status: 200, cacheControl: "no-store", body: RUNNING_STATUS });
	});

	it("passes the worker's 404 SCAN_NOT_FOUND through", async () => {
		// GIVEN
		const workerBody = { error: { code: "SCAN_NOT_FOUND", message: "Gone." } };
		stubWorker(404, workerBody);

		// WHEN
		const response = await GET(scanRequest("GET"), scanRouteContext(SCAN_ID));

		// THEN
		expect({ status: response.status, body: await response.json() }).toEqual({
			status: 404,
			body: workerBody,
		});
	});

	it("answers 502 WORKER_UNAVAILABLE without caching when the worker is down", async () => {
		// GIVEN
		stubUnreachableWorker();

		// WHEN
		const response = await GET(scanRequest("GET"), scanRouteContext(SCAN_ID));

		// THEN
		expect({
			status: response.status,
			cacheControl: response.headers.get("cache-control"),
			code: (await response.json()).error.code,
		}).toEqual({
			status: 502,
			cacheControl: "no-store",
			code: "WORKER_UNAVAILABLE",
		});
	});
});

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
	stubWorker,
} from "@/testing/stub-worker";
import { DELETE } from "./route";

const CANCELLED_STATUS = { ...RUNNING_STATUS, status: "cancelled" };

describe("DELETE /api/scans/[id]", () => {
	it("asks the worker to cancel the scan with token and client id", async () => {
		// GIVEN
		const calls = stubWorker(202, RUNNING_STATUS);

		// WHEN
		await DELETE(
			scanRequest("DELETE", { "x-forwarded-for": "203.0.113.7" }),
			scanRouteContext(SCAN_ID),
		);

		// THEN
		expect(calls).toEqual([
			{
				url: `${STUB_WORKER_URL}/scans/${SCAN_ID}`,
				method: "DELETE",
				headers: {
					authorization: `Bearer ${STUB_WORKER_TOKEN}`,
					"x-client-id": "203.0.113.7",
				},
				body: null,
			},
		]);
	});

	it("passes the worker's 202 cancel acknowledgement through", async () => {
		// GIVEN
		stubWorker(202, RUNNING_STATUS);

		// WHEN
		const response = await DELETE(
			scanRequest("DELETE"),
			scanRouteContext(SCAN_ID),
		);

		// THEN
		expect({ status: response.status, body: await response.json() }).toEqual({
			status: 202,
			body: RUNNING_STATUS,
		});
	});

	it("passes the worker's 200 for an already finished scan through", async () => {
		// GIVEN
		stubWorker(200, CANCELLED_STATUS);

		// WHEN
		const response = await DELETE(
			scanRequest("DELETE"),
			scanRouteContext(SCAN_ID),
		);

		// THEN
		expect({ status: response.status, body: await response.json() }).toEqual({
			status: 200,
			body: CANCELLED_STATUS,
		});
	});
});

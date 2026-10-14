import { describe, expect, it, vi } from "vitest";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import {
	RUNNING_STATUS,
	SCAN_ID,
	scanRequest,
	scanRouteContext,
} from "@/testing/scan-route-requests";
import { RUNNING_STORED_SCAN } from "@/testing/stored-scans";
import {
	STUB_WORKER_TOKEN,
	STUB_WORKER_URL,
	stubWorker,
} from "@/testing/stub-worker";
import { useFakeClerk } from "@/testing/use-fake-clerk";
import { DELETE } from "./route";

vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(),
	currentUser: vi.fn(),
}));
vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

const CANCELLED_STATUS = { ...RUNNING_STATUS, status: "cancelled" };
describe("DELETE /api/scans/[id]", () => {
	const store = useFakeScanStore();
	useFakeClerk();

	it("asks the worker to cancel the scan with token and the user id as client id", async () => {
		// GIVEN
		store().get.mockResolvedValue(RUNNING_STORED_SCAN);
		const calls = stubWorker(202, RUNNING_STATUS);

		// WHEN
		await DELETE(scanRequest("DELETE"), scanRouteContext(SCAN_ID));

		// THEN
		expect(calls).toEqual([
			{
				url: `${STUB_WORKER_URL}/scans/${SCAN_ID}`,
				method: "DELETE",
				headers: {
					authorization: `Bearer ${STUB_WORKER_TOKEN}`,
					"x-client-id": "user_test",
				},
				body: null,
			},
		]);
	});

	it("passes the worker's 202 cancel acknowledgement through", async () => {
		// GIVEN
		store().get.mockResolvedValue(RUNNING_STORED_SCAN);
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
		store().get.mockResolvedValue(RUNNING_STORED_SCAN);
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

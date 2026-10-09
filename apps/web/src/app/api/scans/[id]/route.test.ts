import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	RUNNING_STORED_SCAN,
	useFakeScanStore,
} from "@/testing/fake-scan-store";
import {
	RUNNING_STATUS,
	SCAN_ID,
	scanRequest,
	scanRouteContext,
} from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import {
	STUB_WORKER_TOKEN,
	STUB_WORKER_URL,
	stubWorker,
} from "@/testing/stub-worker";
import { GET } from "./route";

vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

const readResponse = async (response: Response) => ({
	status: response.status,
	cacheControl: response.headers.get("cache-control"),
	body: await response.json(),
});

describe("GET /api/scans/[id]", () => {
	const store = useFakeScanStore();

	beforeEach(() => {
		spyOnServerLog();
		store().get.mockResolvedValue(RUNNING_STORED_SCAN);
	});

	it("polls the worker for a running scan with token and client id", async () => {
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

	it("returns the live scan status without caching", async () => {
		// GIVEN
		stubWorker(200, RUNNING_STATUS);

		// WHEN
		const response = await GET(scanRequest("GET"), scanRouteContext(SCAN_ID));

		// THEN
		expect(await readResponse(response)).toEqual({
			status: 200,
			cacheControl: "no-store",
			body: RUNNING_STATUS,
		});
	});

	it("answers 404 SCAN_NOT_FOUND without caching for an unknown scan", async () => {
		// GIVEN
		store().get.mockResolvedValue(null);
		stubWorker(200, RUNNING_STATUS);

		// WHEN
		const response = await GET(scanRequest("GET"), scanRouteContext(SCAN_ID));

		// THEN
		const { status, cacheControl, body } = await readResponse(response);
		expect([status, cacheControl, body.error.code]).toEqual([
			404,
			"no-store",
			"SCAN_NOT_FOUND",
		]);
	});
});

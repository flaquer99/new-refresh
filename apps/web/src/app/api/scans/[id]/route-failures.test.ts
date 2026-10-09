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
import { stubUnreachableWorker, stubWorker } from "@/testing/stub-worker";
import { GET } from "./route";

vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

const readResponse = async (response: Response) => ({
	status: response.status,
	cacheControl: response.headers.get("cache-control"),
	body: await response.json(),
});

describe("GET /api/scans/[id] failures", () => {
	const store = useFakeScanStore();

	beforeEach(() => {
		spyOnServerLog();
		store().get.mockResolvedValue(RUNNING_STORED_SCAN);
	});

	it("answers 502 WORKER_UNAVAILABLE without caching when the worker is down", async () => {
		// GIVEN
		stubUnreachableWorker();

		// WHEN
		const response = await GET(scanRequest("GET"), scanRouteContext(SCAN_ID));

		// THEN
		const { status, cacheControl, body } = await readResponse(response);
		expect([status, cacheControl, body.error.code]).toEqual([
			502,
			"no-store",
			"WORKER_UNAVAILABLE",
		]);
	});

	it("answers 500 INTERNAL_ERROR when the database is down", async () => {
		// GIVEN
		store().settleStale.mockRejectedValue(new Error("Connection refused"));
		stubWorker(200, RUNNING_STATUS);

		// WHEN
		const response = await GET(scanRequest("GET"), scanRouteContext(SCAN_ID));

		// THEN
		expect((await readResponse(response)).body.error.code).toBe(
			"INTERNAL_ERROR",
		);
	});
});

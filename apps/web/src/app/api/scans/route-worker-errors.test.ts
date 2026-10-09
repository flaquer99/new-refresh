import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import {
	SCAN_ID,
	startScanRequest,
	VALID_SCAN_BODY,
} from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { stubUnreachableWorker, stubWorker } from "@/testing/stub-worker";
import { POST } from "./route";

vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

describe("POST /api/scans worker errors", () => {
	useFakeScanStore();

	beforeEach(() => {
		vi.spyOn(crypto, "randomUUID").mockReturnValue(SCAN_ID);
		spyOnServerLog();
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

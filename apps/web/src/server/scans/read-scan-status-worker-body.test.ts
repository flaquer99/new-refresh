import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { MEMBER_ACTOR } from "@/testing/scan-actors";
import { RUNNING_STATUS, SCAN_ID } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { RUNNING_STORED_SCAN } from "@/testing/stored-scans";
import {
	STUB_WORKER_TOKEN,
	STUB_WORKER_URL,
	stubWorker,
} from "@/testing/stub-worker";
import { readScanStatus } from "./read-scan-status";

vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

const READ = { scanId: SCAN_ID, actor: MEMBER_ACTOR };
const COMPLETED_WITHOUT_REPORT = {
	...RUNNING_STATUS,
	status: "completed",
	report: null,
	error: null,
};

const stubWorkerAnsweringText = (text: string) => {
	vi.stubEnv("SCAN_WORKER_URL", STUB_WORKER_URL);
	vi.stubEnv("SCAN_WORKER_TOKEN", STUB_WORKER_TOKEN);
	vi.stubGlobal(
		"fetch",
		vi.fn(() => Promise.resolve(new Response(text, { status: 200 }))),
	);
};

describe("readScanStatus with a worker body it cannot use", () => {
	const store = useFakeScanStore();
	let serverLog: ReturnType<typeof spyOnServerLog>;

	beforeEach(() => {
		serverLog = spyOnServerLog();
		store().get.mockResolvedValue(RUNNING_STORED_SCAN);
	});

	it("keeps the scan running when the worker reports a final status it cannot record", async () => {
		// GIVEN
		stubWorker(200, COMPLETED_WITHOUT_REPORT);

		// WHEN
		const response = await readScanStatus(READ);

		// THEN
		expect((await response.json()).status).toBe("running");
	});

	it("logs the final status it could not record", async () => {
		// GIVEN
		stubWorker(200, COMPLETED_WITHOUT_REPORT);

		// WHEN
		await readScanStatus(READ);

		// THEN
		expect(serverLog()).toContainEqual(
			expect.objectContaining({
				event: "scan.result_invalid",
				scanId: SCAN_ID,
			}),
		);
	});

	it("answers INTERNAL_ERROR when the worker body is not JSON", async () => {
		// GIVEN
		stubWorkerAnsweringText("<html>oops</html>");

		// WHEN
		const response = await readScanStatus(READ);

		// THEN
		expect((await response.json()).error.code).toBe("INTERNAL_ERROR");
	});
});

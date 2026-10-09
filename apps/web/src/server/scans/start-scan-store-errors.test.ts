import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { SCAN_ID, VALID_SCAN_BODY } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { stubWorker } from "@/testing/stub-worker";
import { startScan } from "./start-scan";

vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

const START = { request: VALID_SCAN_BODY, clientId: "203.0.113.7" };
const DATABASE_DOWN = new Error("Can't reach database server");

describe("startScan when the database fails", () => {
	const store = useFakeScanStore();
	let serverLog: ReturnType<typeof spyOnServerLog>;

	beforeEach(() => {
		vi.spyOn(crypto, "randomUUID").mockReturnValue(SCAN_ID);
		serverLog = spyOnServerLog();
	});

	it("answers INTERNAL_ERROR without calling the worker", async () => {
		// GIVEN
		store().createRunning.mockRejectedValue(DATABASE_DOWN);
		const calls = stubWorker(201, { scanId: SCAN_ID });

		// WHEN
		const response = await startScan(START);

		// THEN
		expect([response.status, calls.length]).toEqual([500, 0]);
	});

	it("logs db.unavailable with the failed operation", async () => {
		// GIVEN
		store().createRunning.mockRejectedValue(DATABASE_DOWN);
		stubWorker(201, { scanId: SCAN_ID });

		// WHEN
		await startScan(START);

		// THEN
		expect(serverLog()).toContainEqual(
			expect.objectContaining({
				event: "db.unavailable",
				operation: "createRunning",
			}),
		);
	});

	it("still relays the worker rejection when discarding fails", async () => {
		// GIVEN
		store().discard.mockRejectedValue(DATABASE_DOWN);
		stubWorker(409, { error: { code: "SCAN_ALREADY_RUNNING", message: "x" } });

		// WHEN
		const response = await startScan(START);

		// THEN
		expect(response.status).toBe(409);
	});

	it("logs a scan discarded after a worker timeout", async () => {
		// GIVEN
		stubWorker(502, { error: { code: "WORKER_UNAVAILABLE", message: "x" } });

		// WHEN
		await startScan(START);

		// THEN
		expect(serverLog()).toContainEqual(
			expect.objectContaining({
				event: "scan.discarded_after_timeout",
				scanId: SCAN_ID,
			}),
		);
	});
});

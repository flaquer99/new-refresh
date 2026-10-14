import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { MEMBER_ACTOR } from "@/testing/scan-actors";
import { SCAN_ID, VALID_SCAN_BODY } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import {
	stubHangingWorker,
	stubUnreachableWorker,
	WORKER_TIMEOUT_MS,
} from "@/testing/stub-worker";
import { startScan } from "./start-scan";

vi.mock("@/server/auth/resolve-starter-name", () => ({
	resolveStarterName: vi.fn(() => Promise.resolve("Ana Souza")),
}));
vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

const START = { request: VALID_SCAN_BODY, actor: MEMBER_ACTOR };
const DISCARDED_AFTER_TIMEOUT = expect.objectContaining({
	event: "scan.discarded_after_timeout",
});

describe("startScan discard logging", () => {
	useFakeScanStore();
	let serverLog: ReturnType<typeof spyOnServerLog>;

	beforeEach(() => {
		vi.useFakeTimers();
		vi.spyOn(crypto, "randomUUID").mockReturnValue(SCAN_ID);
		serverLog = spyOnServerLog();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("logs a discard after the worker timed out on an accepted request", async () => {
		// GIVEN
		stubHangingWorker();
		const started = startScan(START);

		// WHEN
		await vi.advanceTimersByTimeAsync(WORKER_TIMEOUT_MS);
		await started;

		// THEN
		expect(serverLog()).toContainEqual(DISCARDED_AFTER_TIMEOUT);
	});

	it("does not log a timeout discard when the worker refused the connection", async () => {
		// GIVEN
		stubUnreachableWorker();

		// WHEN
		await startScan(START);

		// THEN
		expect(serverLog()).not.toContainEqual(DISCARDED_AFTER_TIMEOUT);
	});
});

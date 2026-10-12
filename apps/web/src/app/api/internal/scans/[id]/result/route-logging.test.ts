import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	CALLBACK_TOKEN,
	COMPLETED_RESULT,
	callbackRequest,
	useCallbackToken,
} from "@/testing/callback-requests";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { SCAN_ID, scanRouteContext } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { POST } from "./route";

vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

const WRONG_TOKEN = "w".repeat(40);

describe("POST /api/internal/scans/[id]/result logging", () => {
	useFakeScanStore();
	useCallbackToken();
	let serverLog: ReturnType<typeof spyOnServerLog>;

	beforeEach(() => {
		serverLog = spyOnServerLog();
	});

	it("logs a rejected callback as unauthorized", async () => {
		// WHEN
		await POST(
			callbackRequest(COMPLETED_RESULT, `Bearer ${WRONG_TOKEN}`),
			scanRouteContext(SCAN_ID),
		);

		// THEN
		expect(serverLog()).toContainEqual(
			expect.objectContaining({ event: "callback.unauthorized" }),
		);
	});

	it("never writes a token to the log", async () => {
		// WHEN
		await POST(
			callbackRequest(COMPLETED_RESULT, `Bearer ${WRONG_TOKEN}`),
			scanRouteContext(SCAN_ID),
		);

		// THEN
		expect(JSON.stringify(serverLog())).not.toMatch(
			new RegExp(`${WRONG_TOKEN}|${CALLBACK_TOKEN}`),
		);
	});

	it("logs an invalid result with the path of its first problem", async () => {
		// GIVEN
		const { finishedAt: _missing, ...withoutFinishedAt } = COMPLETED_RESULT;

		// WHEN
		await POST(
			callbackRequest(withoutFinishedAt, `Bearer ${CALLBACK_TOKEN}`),
			scanRouteContext(SCAN_ID),
		);

		// THEN
		expect(serverLog()).toContainEqual(
			expect.objectContaining({
				event: "callback.invalid",
				scanId: SCAN_ID,
				issuePath: "finishedAt",
			}),
		);
	});
});

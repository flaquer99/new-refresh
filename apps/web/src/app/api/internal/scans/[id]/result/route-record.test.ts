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

const AUTHORIZATION = `Bearer ${CALLBACK_TOKEN}`;
const OTHER_SCAN_ID = "11111111-1111-4111-8111-111111111111";

const postResult = async (body: unknown, scanId = SCAN_ID) => {
	const response = await POST(
		callbackRequest(body, AUTHORIZATION),
		scanRouteContext(scanId),
	);
	return { status: response.status, body: await response.json() };
};

describe("POST /api/internal/scans/[id]/result recording", () => {
	const store = useFakeScanStore();
	useCallbackToken();

	beforeEach(() => {
		spyOnServerLog();
	});

	it("stores the result of the scan", async () => {
		// WHEN
		await postResult(COMPLETED_RESULT);

		// THEN
		expect(store().recordResult).toHaveBeenCalledWith(COMPLETED_RESULT);
	});

	it.each([
		["recorded", 200, { recorded: true }],
		["already-final", 200, { recorded: false }],
	] as const)("maps %s to %d", async (outcome, status, body) => {
		// GIVEN
		store().recordResult.mockResolvedValue(outcome);

		// WHEN
		const answer = await postResult(COMPLETED_RESULT);

		// THEN
		expect(answer).toEqual({ status, body });
	});

	it("answers 404 when the scan no longer exists", async () => {
		// GIVEN
		store().recordResult.mockResolvedValue("not-found");

		// WHEN
		const answer = await postResult(COMPLETED_RESULT);

		// THEN
		expect([answer.status, answer.body.error.code]).toEqual([
			404,
			"SCAN_NOT_FOUND",
		]);
	});

	it("rejects a result whose scan id differs from the path", async () => {
		// WHEN
		const answer = await postResult(COMPLETED_RESULT, OTHER_SCAN_ID);

		// THEN
		expect([answer.status, store().recordResult.mock.calls.length]).toEqual([
			400, 0,
		]);
	});

	it("rejects a body that is not a scan result", async () => {
		// WHEN
		const answer = await postResult({ status: "completed" });

		// THEN
		expect(answer.body.error.code).toBe("INVALID_REQUEST");
	});

	it("answers 500 so the worker retries when the database is down", async () => {
		// GIVEN
		store().recordResult.mockRejectedValue(new Error("Connection refused"));

		// WHEN
		const answer = await postResult(COMPLETED_RESULT);

		// THEN
		expect(answer.status).toBe(500);
	});
});

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

describe("POST /api/internal/scans/[id]/result auth", () => {
	const store = useFakeScanStore();
	useCallbackToken();

	beforeEach(() => {
		spyOnServerLog();
	});

	it.each([
		["a missing", undefined],
		["a wrong", `Bearer ${"x".repeat(32)}`],
	])("rejects %s token with 401", async (_label, authorization) => {
		// GIVEN
		const request = callbackRequest(COMPLETED_RESULT, authorization);

		// WHEN
		const response = await POST(request, scanRouteContext(SCAN_ID));

		// THEN
		expect([response.status, store().recordResult.mock.calls.length]).toEqual([
			401, 0,
		]);
	});

	it("rejects every callback when no callback token is configured", async () => {
		// GIVEN
		vi.stubEnv("SCAN_CALLBACK_TOKEN", "");

		// WHEN
		const response = await POST(
			callbackRequest(COMPLETED_RESULT, `Bearer ${CALLBACK_TOKEN}`),
			scanRouteContext(SCAN_ID),
		);

		// THEN
		expect(response.status).toBe(401);
	});

	it("does not read the body of an unauthorized callback", async () => {
		// GIVEN
		const request = callbackRequest(COMPLETED_RESULT, undefined);
		const json = vi.spyOn(request, "json");

		// WHEN
		await POST(request, scanRouteContext(SCAN_ID));

		// THEN
		expect(json).not.toHaveBeenCalled();
	});
});

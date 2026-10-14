import { describe, expect, it, vi } from "vitest";
import {
	CALLBACK_TOKEN,
	COMPLETED_RESULT,
	callbackRequest,
	useCallbackToken,
} from "@/testing/callback-requests";
import { fakeClerkStates } from "@/testing/fake-clerk";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { SCAN_ID, scanRouteContext } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { signInAs, useFakeClerk } from "@/testing/use-fake-clerk";
import { POST } from "./route";

vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(),
	currentUser: vi.fn(),
}));
vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

describe("POST /api/internal/scans/[id]/result without a user session", () => {
	const store = useFakeScanStore();
	useFakeClerk();
	useCallbackToken();

	it("records the result for a valid callback token while signed out", async () => {
		// GIVEN
		spyOnServerLog();
		signInAs(fakeClerkStates.signedOut);

		// WHEN
		const response = await POST(
			callbackRequest(COMPLETED_RESULT, `Bearer ${CALLBACK_TOKEN}`),
			scanRouteContext(SCAN_ID),
		);

		// THEN
		expect([response.status, store().recordResult.mock.calls.length]).toEqual([
			200, 1,
		]);
	});
});

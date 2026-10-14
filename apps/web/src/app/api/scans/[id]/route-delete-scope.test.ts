import { describe, expect, it, vi } from "vitest";
import { fakeClerkStates } from "@/testing/fake-clerk";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import {
	RUNNING_STATUS,
	SCAN_ID,
	scanRequest,
	scanRouteContext,
} from "@/testing/scan-route-requests";
import { stubWorker } from "@/testing/stub-worker";
import { signInAs, useFakeClerk } from "@/testing/use-fake-clerk";
import { DELETE } from "./route";

vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(),
	currentUser: vi.fn(),
}));
vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

describe("DELETE /api/scans/[id] permissions scope", () => {
	const store = useFakeScanStore();
	useFakeClerk();

	it("scopes the lookup to the actor's organization", async () => {
		// GIVEN
		stubWorker(202, RUNNING_STATUS);

		// WHEN
		await DELETE(scanRequest("DELETE"), scanRouteContext(SCAN_ID));

		// THEN
		expect(store().get).toHaveBeenCalledWith({
			scanId: SCAN_ID,
			organizationId: "org_test",
		});
	});

	it("answers 401 for a signed-out caller without touching the store", async () => {
		// GIVEN
		signInAs(fakeClerkStates.signedOut);

		// WHEN
		const response = await DELETE(
			scanRequest("DELETE"),
			scanRouteContext(SCAN_ID),
		);

		// THEN
		expect([response.status, store().get.mock.calls.length]).toEqual([401, 0]);
	});

	it("answers 404 for an id that is not a uuid", async () => {
		// WHEN
		const response = await DELETE(
			scanRequest("DELETE"),
			scanRouteContext("not-a-uuid"),
		);

		// THEN
		expect(response.status).toBe(404);
	});
});

import { describe, expect, it, vi } from "vitest";
import { fakeClerkStates } from "@/testing/fake-clerk";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import {
	RUNNING_STATUS,
	SCAN_ID,
	scanRequest,
	scanRouteContext,
} from "@/testing/scan-route-requests";
import { buildStoredScan, RUNNING_STORED_SCAN } from "@/testing/stored-scans";
import { stubWorker } from "@/testing/stub-worker";
import { signInAs, useFakeClerk } from "@/testing/use-fake-clerk";
import { DELETE } from "./route";

vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(),
	currentUser: vi.fn(),
}));
vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

const OTHER_MEMBERS_SCAN = buildStoredScan({
	...RUNNING_STORED_SCAN,
	startedByUserId: "user_other",
});

describe("DELETE /api/scans/[id] permissions", () => {
	const store = useFakeScanStore();
	useFakeClerk();

	it("lets an admin cancel another member's scan", async () => {
		// GIVEN
		signInAs(fakeClerkStates.admin);
		store().get.mockResolvedValue(OTHER_MEMBERS_SCAN);
		const calls = stubWorker(202, RUNNING_STATUS);

		// WHEN
		const response = await DELETE(
			scanRequest("DELETE"),
			scanRouteContext(SCAN_ID),
		);

		// THEN
		expect([response.status, calls.length]).toEqual([202, 1]);
	});

	it("refuses a member cancelling another member's scan", async () => {
		// GIVEN
		store().get.mockResolvedValue(OTHER_MEMBERS_SCAN);
		const calls = stubWorker(202, RUNNING_STATUS);

		// WHEN
		const response = await DELETE(
			scanRequest("DELETE"),
			scanRouteContext(SCAN_ID),
		);

		// THEN
		expect([
			response.status,
			(await response.json()).error.code,
			calls.length,
		]).toEqual([403, "FORBIDDEN", 0]);
	});

	it("answers 404 without calling the worker for a scan of another organization", async () => {
		// GIVEN
		store().get.mockResolvedValue(null);
		const calls = stubWorker(202, RUNNING_STATUS);

		// WHEN
		const response = await DELETE(
			scanRequest("DELETE"),
			scanRouteContext(SCAN_ID),
		);

		// THEN
		expect([response.status, calls.length]).toEqual([404, 0]);
	});
});

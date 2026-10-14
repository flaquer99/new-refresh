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
import { GET } from "./route";

vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(),
	currentUser: vi.fn(),
}));
vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

const readError = async (response: Response) => ({
	status: response.status,
	code: (await response.json()).error.code,
});

describe("GET /api/scans/[id] scoping", () => {
	const store = useFakeScanStore();
	useFakeClerk();

	it("answers 404 SCAN_NOT_FOUND for another organization's scan", async () => {
		// GIVEN
		store().get.mockResolvedValue(null);
		stubWorker(200, RUNNING_STATUS);

		// WHEN
		const response = await GET(scanRequest("GET"), scanRouteContext(SCAN_ID));

		// THEN
		expect(await readError(response)).toEqual({
			status: 404,
			code: "SCAN_NOT_FOUND",
		});
	});

	it("looks the scan up in the actor's organization", async () => {
		// GIVEN
		stubWorker(200, RUNNING_STATUS);

		// WHEN
		await GET(scanRequest("GET"), scanRouteContext(SCAN_ID));

		// THEN
		expect(store().get).toHaveBeenCalledWith({
			scanId: SCAN_ID,
			organizationId: "org_test",
		});
	});

	it("answers 401 UNAUTHORIZED when signed out without touching the store", async () => {
		// GIVEN
		signInAs(fakeClerkStates.signedOut);

		// WHEN
		const response = await GET(scanRequest("GET"), scanRouteContext(SCAN_ID));

		// THEN
		expect([await readError(response), store().get.mock.calls.length]).toEqual([
			{ status: 401, code: "UNAUTHORIZED" },
			0,
		]);
	});

	it("answers 403 ORGANIZATION_REQUIRED for a pending session", async () => {
		// GIVEN
		signInAs(fakeClerkStates.pending);

		// WHEN
		const response = await GET(scanRequest("GET"), scanRouteContext(SCAN_ID));

		// THEN
		expect(await readError(response)).toEqual({
			status: 403,
			code: "ORGANIZATION_REQUIRED",
		});
	});
});

import { describe, expect, it, vi } from "vitest";
import { fakeClerkStates } from "@/testing/fake-clerk";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import {
	startScanRequest,
	VALID_SCAN_BODY,
} from "@/testing/scan-route-requests";
import { stubWorker } from "@/testing/stub-worker";
import { signInAs, useFakeClerk } from "@/testing/use-fake-clerk";
import { POST } from "./route";

vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(),
	currentUser: vi.fn(),
}));
vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

describe("POST /api/scans authorization", () => {
	const store = useFakeScanStore();
	useFakeClerk();

	it("answers 401 UNAUTHORIZED when signed out without touching the store", async () => {
		// GIVEN
		signInAs(fakeClerkStates.signedOut);
		const calls = stubWorker(201, { scanId: "x" });

		// WHEN
		const response = await POST(startScanRequest(VALID_SCAN_BODY));

		// THEN
		expect({
			status: response.status,
			body: await response.json(),
			created: store().createRunning.mock.calls.length,
			forwarded: calls.length,
		}).toEqual({
			status: 401,
			body: {
				error: { code: "UNAUTHORIZED", message: "Sign in to continue." },
			},
			created: 0,
			forwarded: 0,
		});
	});

	it("answers 403 ORGANIZATION_REQUIRED for a pending session", async () => {
		// GIVEN
		signInAs(fakeClerkStates.pending);

		// WHEN
		const response = await POST(startScanRequest(VALID_SCAN_BODY));

		// THEN
		expect([
			response.status,
			(await response.json()).error.code,
			store().createRunning.mock.calls.length,
		]).toEqual([403, "ORGANIZATION_REQUIRED", 0]);
	});

	it("checks the session before reading an invalid body", async () => {
		// GIVEN
		signInAs(fakeClerkStates.signedOut);

		// WHEN
		const response = await POST(startScanRequest("not json"));

		// THEN
		expect(response.status).toBe(401);
	});
});

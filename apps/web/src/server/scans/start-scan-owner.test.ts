import { currentUser } from "@clerk/nextjs/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { MEMBER_ACTOR } from "@/testing/scan-actors";
import { SCAN_ID, VALID_SCAN_BODY } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { stubWorker } from "@/testing/stub-worker";
import { STARTER_NAME, useFakeClerk } from "@/testing/use-fake-clerk";
import { startScan } from "./start-scan";

vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(),
	currentUser: vi.fn(),
}));
vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

const START = { request: VALID_SCAN_BODY, actor: MEMBER_ACTOR };

describe("startScan ownership", () => {
	const store = useFakeScanStore();
	useFakeClerk();

	beforeEach(() => {
		vi.spyOn(crypto, "randomUUID").mockReturnValue(SCAN_ID);
		spyOnServerLog();
	});

	it("records the organization, user, and starter name", async () => {
		// GIVEN
		stubWorker(201, { scanId: SCAN_ID });

		// WHEN
		await startScan(START);

		// THEN
		expect(store().createRunning).toHaveBeenCalledWith(
			expect.objectContaining({
				owner: {
					organizationId: MEMBER_ACTOR.organizationId,
					startedByUserId: MEMBER_ACTOR.userId,
					startedByName: STARTER_NAME,
				},
			}),
		);
	});

	it("stores a null starter name when Clerk is unreachable and still answers 201", async () => {
		// GIVEN
		vi.mocked(currentUser).mockRejectedValue(new Error("Clerk down"));
		stubWorker(201, { scanId: SCAN_ID });

		// WHEN
		const response = await startScan(START);

		// THEN
		expect([
			response.status,
			store().createRunning.mock.calls[0]?.[0].owner.startedByName,
		]).toEqual([201, null]);
	});

	it("sends the user id as x-client-id to the worker", async () => {
		// GIVEN
		const calls = stubWorker(201, { scanId: SCAN_ID });

		// WHEN
		await startScan(START);

		// THEN
		expect(calls[0]?.headers["x-client-id"]).toBe(MEMBER_ACTOR.userId);
	});
});

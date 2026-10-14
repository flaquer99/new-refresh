import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { buildViolation } from "@/testing/finding-fixtures";
import { buildReport } from "@/testing/report-fixtures";
import { SCAN_ID } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { buildStoredScan } from "@/testing/stored-scans";
import { stubWorker } from "@/testing/stub-worker";
import { fakeClerkStates } from "@/testing/fake-clerk";
import { signInAs, useFakeClerk } from "@/testing/use-fake-clerk";
import { GET } from "./route";

vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(),
	currentUser: vi.fn(),
}));
vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

const FINDING_ID = "violation-1";

const previewRequest = () =>
	new Request(
		`http://localhost/api/scans/${SCAN_ID}/findings/${FINDING_ID}/preview`,
	);

const context = (id = SCAN_ID, findingId = FINDING_ID) => ({
	params: Promise.resolve({ id, findingId }),
});

describe("GET /api/scans/[id]/findings/[findingId]/preview", () => {
	const store = useFakeScanStore();
	useFakeClerk();

	beforeEach(() => {
		spyOnServerLog();
		const report = buildReport({ violations: [buildViolation()] });
		store().get.mockResolvedValue(buildStoredScan({ report }));
	});

	it("answers the preview without caching", async () => {
		// GIVEN
		stubWorker(200, {
			kind: "unavailable",
			reason: "not-html",
			httpStatus: 200,
		});

		// WHEN
		const response = await GET(previewRequest(), context());

		// THEN
		expect([response.status, response.headers.get("cache-control")]).toEqual([
			200,
			"no-store",
		]);
	});

	it("forwards the user id to the worker as client id", async () => {
		// GIVEN
		const calls = stubWorker(200, {
			kind: "unavailable",
			reason: "not-html",
			httpStatus: 200,
		});

		// WHEN
		await GET(previewRequest(), context());

		// THEN
		expect(calls[0]?.headers["x-client-id"]).toBe("user_test");
	});

	it("answers 401 UNAUTHORIZED when signed out without touching the store", async () => {
		// GIVEN
		signInAs(fakeClerkStates.signedOut);

		// WHEN
		const response = await GET(previewRequest(), context());

		// THEN
		expect([
			response.status,
			(await response.json()).error.code,
			store().get.mock.calls.length,
		]).toEqual([401, "UNAUTHORIZED", 0]);
	});

	it("answers 404 SCAN_NOT_FOUND for another organization's scan", async () => {
		// GIVEN
		store().get.mockResolvedValue(null);

		// WHEN
		const response = await GET(previewRequest(), context());

		// THEN
		expect([response.status, (await response.json()).error.code]).toEqual([
			404,
			"SCAN_NOT_FOUND",
		]);
	});

	it("answers 404 FINDING_NOT_FOUND without caching", async () => {
		// GIVEN
		stubWorker(200, {});

		// WHEN
		const response = await GET(previewRequest(), context(SCAN_ID, "nope"));

		// THEN
		expect([
			response.status,
			response.headers.get("cache-control"),
			(await response.json()).error.code,
		]).toEqual([404, "no-store", "FINDING_NOT_FOUND"]);
	});

	it("answers 500 INTERNAL_ERROR when the store fails", async () => {
		// GIVEN
		store().get.mockRejectedValue(new Error("db down"));

		// WHEN
		const response = await GET(previewRequest(), context());

		// THEN
		expect([response.status, (await response.json()).error.code]).toEqual([
			500,
			"INTERNAL_ERROR",
		]);
	});
});

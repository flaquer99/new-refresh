import { describe, expect, it, vi } from "vitest";
import { getScanStore } from "@/server/db/scan-store";
import { TEST_ORGANIZATION_ID, TEST_USER_ID } from "@/testing/fake-clerk";
import { buildViolation } from "@/testing/finding-fixtures";
import { buildReport } from "@/testing/report-fixtures";
import { SCAN_ID } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { stubWorker } from "@/testing/stub-worker";
import { useFakeClerk } from "@/testing/use-fake-clerk";
import { useTestDatabase } from "@/testing/use-test-database";
import { GET } from "./route";

vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(),
	currentUser: vi.fn(),
}));

const FINDING_ID = "violation-1";
const PAGE_URL = "https://www.example.org/";
const STARTED_AT = new Date("2026-10-09T10:00:00.000Z");

const seedCompletedScan = async () => {
	const store = getScanStore();
	await store.createRunning({
		scanId: SCAN_ID,
		request: { url: PAGE_URL, depth: 0 },
		startedAt: STARTED_AT,
		owner: {
			organizationId: TEST_ORGANIZATION_ID,
			startedByUserId: TEST_USER_ID,
			startedByName: null,
		},
	});
	await store.recordResult({
		scanId: SCAN_ID,
		status: "completed",
		report: buildReport({ violations: [buildViolation()] }),
		error: null,
		finishedAt: "2026-10-09T10:00:20.000Z",
	});
};

const getPreview = (findingId: string) =>
	GET(
		new Request(
			`http://localhost/api/scans/${SCAN_ID}/findings/${findingId}/preview`,
		),
		{ params: Promise.resolve({ id: SCAN_ID, findingId }) },
	);

describe("finding preview route with a real database", () => {
	useTestDatabase();
	useFakeClerk();

	it("serves a loaded preview for a stored finding", async () => {
		// GIVEN
		spyOnServerLog();
		await seedCompletedScan();
		const calls = stubWorker(200, {
			kind: "loaded",
			finalUrl: PAGE_URL,
			html: "<html><head></head><body><img></body></html>",
		});
		vi.spyOn(crypto, "randomUUID").mockReturnValue(
			"22222222-2222-4222-8222-222222222222",
		);

		// WHEN
		const response = await getPreview(FINDING_ID);

		// THEN
		const body = await response.json();
		expect([response.status, body.kind, body.pageUrl, calls[0]?.body]).toEqual([
			200,
			"loaded",
			PAGE_URL,
			{ pageUrl: PAGE_URL },
		]);
	});

	it("answers 404 FINDING_NOT_FOUND for an unknown finding of a stored scan", async () => {
		// GIVEN
		spyOnServerLog();
		await seedCompletedScan();
		const calls = stubWorker(200, {});

		// WHEN
		const response = await getPreview("missing");

		// THEN
		expect([
			response.status,
			(await response.json()).error.code,
			calls.length,
		]).toEqual([404, "FINDING_NOT_FOUND", 0]);
	});
});

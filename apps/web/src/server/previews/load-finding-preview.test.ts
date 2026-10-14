import { beforeEach, describe, expect, it, vi } from "vitest";
import { MEMBER_ACTOR } from "@/testing/scan-actors";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { buildViolation } from "@/testing/finding-fixtures";
import { buildReport } from "@/testing/report-fixtures";
import { SCAN_ID } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { buildStoredScan } from "@/testing/stored-scans";
import {
	stubHangingWorker,
	stubUnreachableWorker,
	stubWorker,
} from "@/testing/stub-worker";
import { loadFindingPreview } from "./load-finding-preview";

vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

const FINDING_ID = "violation-1";
const PAGE_URL = "https://www.example.org/";
const PARAMS = { scanId: SCAN_ID, findingId: FINDING_ID, actor: MEMBER_ACTOR };
const WORKER_TIMEOUT_MS = 12_000;

const describeResponse = async (response: Response) => {
	const body = await response.json();
	return { status: response.status, code: body.error?.code, kind: body.kind };
};

describe("loadFindingPreview", () => {
	const store = useFakeScanStore();
	let readLog: ReturnType<typeof spyOnServerLog>;

	beforeEach(() => {
		readLog = spyOnServerLog();
		const report = buildReport({ violations: [buildViolation()] });
		store().get.mockResolvedValue(buildStoredScan({ report }));
	});

	it("looks the scan up in the actor's organization", async () => {
		// GIVEN
		stubWorker(200, {
			kind: "unavailable",
			reason: "not-html",
			httpStatus: 200,
		});

		// WHEN
		await loadFindingPreview(PARAMS);

		// THEN
		expect(store().get).toHaveBeenCalledWith({
			scanId: SCAN_ID,
			organizationId: MEMBER_ACTOR.organizationId,
		});
	});

	it("forwards the actor's user id to the worker as client id", async () => {
		// GIVEN
		const calls = stubWorker(200, {
			kind: "unavailable",
			reason: "not-html",
			httpStatus: 200,
		});

		// WHEN
		await loadFindingPreview(PARAMS);

		// THEN
		expect(calls[0]?.headers["x-client-id"]).toBe(MEMBER_ACTOR.userId);
	});

	it("answers SCAN_NOT_FOUND for an unknown scan", async () => {
		// GIVEN
		store().get.mockResolvedValue(null);

		// WHEN
		const response = await loadFindingPreview(PARAMS);

		// THEN
		expect(await describeResponse(response)).toMatchObject({
			status: 404,
			code: "SCAN_NOT_FOUND",
		});
	});

	it("answers FINDING_NOT_FOUND for a scan without a report", async () => {
		// GIVEN
		store().get.mockResolvedValue(buildStoredScan({ report: null }));

		// WHEN
		const response = await loadFindingPreview(PARAMS);

		// THEN
		expect(await describeResponse(response)).toMatchObject({
			status: 404,
			code: "FINDING_NOT_FOUND",
		});
	});

	it("answers FINDING_NOT_FOUND for an unknown finding without calling the worker", async () => {
		// GIVEN
		const calls = stubWorker(200, {});

		// WHEN
		const response = await loadFindingPreview({ ...PARAMS, findingId: "x" });

		// THEN
		expect([response.status, calls.length]).toEqual([404, 0]);
	});

	it("relays an unreachable worker as 502 WORKER_UNAVAILABLE and logs it", async () => {
		// GIVEN
		stubUnreachableWorker();

		// WHEN
		const response = await loadFindingPreview(PARAMS);

		// THEN
		expect([
			await describeResponse(response),
			readLog().some(
				(line) =>
					"event" in line && line.event === "preview.worker_unavailable",
			),
		]).toEqual([
			{ status: 502, code: "WORKER_UNAVAILABLE", kind: undefined },
			true,
		]);
	});

	it("maps a worker timeout to unavailable with reason timeout", async () => {
		// GIVEN
		vi.useFakeTimers();
		stubHangingWorker();

		// WHEN
		const pending = loadFindingPreview(PARAMS);
		await vi.advanceTimersByTimeAsync(WORKER_TIMEOUT_MS);
		const response = await pending;
		vi.useRealTimers();

		// THEN
		expect(await response.json()).toEqual({
			kind: "unavailable",
			pageUrl: PAGE_URL,
			reason: "timeout",
			httpStatus: null,
		});
	});

	it("asks the worker for the stored page url, never a caller-supplied one", async () => {
		// GIVEN
		const calls = stubWorker(200, {
			kind: "loaded",
			finalUrl: PAGE_URL,
			html: "<p>x</p>",
		});

		// WHEN
		await loadFindingPreview(PARAMS);

		// THEN
		expect([calls[0]?.url, calls[0]?.body]).toEqual([
			"http://worker.test:4100/previews",
			{ pageUrl: PAGE_URL },
		]);
	});
});

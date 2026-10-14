import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { buildViolation } from "@/testing/finding-fixtures";
import { buildReport } from "@/testing/report-fixtures";
import { SCAN_ID } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { buildStoredScan } from "@/testing/stored-scans";
import { stubWorker } from "@/testing/stub-worker";
import { loadFindingPreview } from "./load-finding-preview";

vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

const PAGE_URL = "https://www.example.org/";
const FINAL_URL = "https://www.example.org/home";
const PARAMS = { scanId: SCAN_ID, findingId: "violation-1", clientId: "c" };
const TOKEN = "11111111-1111-4111-8111-111111111111";

describe("loadFindingPreview worker bodies", () => {
	const store = useFakeScanStore();

	beforeEach(() => {
		spyOnServerLog();
		const report = buildReport({ violations: [buildViolation()] });
		store().get.mockResolvedValue(buildStoredScan({ report }));
		vi.spyOn(crypto, "randomUUID").mockReturnValue(TOKEN);
	});

	it("returns a loaded preview with the rewritten document and token", async () => {
		// GIVEN
		stubWorker(200, { kind: "loaded", finalUrl: FINAL_URL, html: "<p>x</p>" });

		// WHEN
		const body = await (await loadFindingPreview(PARAMS)).json();

		// THEN
		expect({ ...body, document: body.document.includes(TOKEN) }).toEqual({
			kind: "loaded",
			pageUrl: PAGE_URL,
			finalUrl: FINAL_URL,
			document: true,
			token: TOKEN,
		});
	});

	it("relays an unavailable page as a 200 unavailable preview", async () => {
		// GIVEN
		stubWorker(200, {
			kind: "unavailable",
			reason: "http-error",
			httpStatus: 404,
		});

		// WHEN
		const response = await loadFindingPreview(PARAMS);

		// THEN
		expect([response.status, await response.json()]).toEqual([
			200,
			{
				kind: "unavailable",
				pageUrl: PAGE_URL,
				reason: "http-error",
				httpStatus: 404,
			},
		]);
	});

	it("answers 500 INTERNAL_ERROR when the worker body breaks the contract", async () => {
		// GIVEN
		stubWorker(200, { kind: "weird" });

		// WHEN
		const response = await loadFindingPreview(PARAMS);

		// THEN
		expect([response.status, (await response.json()).error.code]).toEqual([
			500,
			"INTERNAL_ERROR",
		]);
	});
});

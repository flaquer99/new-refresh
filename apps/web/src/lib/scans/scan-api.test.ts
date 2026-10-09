import { describe, expect, it } from "vitest";
import { buildStatus } from "@/testing/report-fixtures";
import { stubFetch } from "@/testing/stub-fetch";
import { cancelScan, getScan, startScan } from "./scan-api";

const SCAN_ID = "scan-1";

describe("scan API client", () => {
	it("starts a scan by posting the request as JSON", async () => {
		// GIVEN
		const fetchMock = stubFetch(
			Response.json({ scanId: SCAN_ID }, { status: 201 }),
		);

		// WHEN
		const result = await startScan({
			url: "https://www.example.org/",
			depth: 1,
		});

		// THEN
		expect(result).toEqual({ ok: true, data: { scanId: SCAN_ID } });
		expect(fetchMock).toHaveBeenCalledWith("/api/scans", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ url: "https://www.example.org/", depth: 1 }),
		});
	});

	it("reads the scan status without caching", async () => {
		// GIVEN
		const status = buildStatus();
		const fetchMock = stubFetch(Response.json(status));

		// WHEN
		const result = await getScan(SCAN_ID);

		// THEN
		expect(result).toEqual({ ok: true, data: status });
		expect(fetchMock).toHaveBeenCalledWith("/api/scans/scan-1", {
			method: "GET",
			cache: "no-store",
		});
	});

	it("cancels a scan with a DELETE request", async () => {
		// GIVEN
		const fetchMock = stubFetch(Response.json(buildStatus(), { status: 202 }));

		// WHEN
		await cancelScan(SCAN_ID);

		// THEN
		expect(fetchMock).toHaveBeenCalledWith("/api/scans/scan-1", {
			method: "DELETE",
		});
	});
});

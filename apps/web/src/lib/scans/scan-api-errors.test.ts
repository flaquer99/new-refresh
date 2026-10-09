import { describe, expect, it } from "vitest";
import { stubFetch } from "@/testing/stub-fetch";
import { getScan, startScan } from "./scan-api";

const SCAN_ID = "scan-1";
const URL_NOT_ALLOWED = {
	code: "URL_NOT_ALLOWED",
	message:
		"This address points to a private or local network and can't be scanned.",
} as const;

describe("scan API client errors", () => {
	it("returns the error from an error envelope", async () => {
		// GIVEN
		stubFetch(Response.json({ error: URL_NOT_ALLOWED }, { status: 422 }));

		// WHEN
		const result = await startScan({ url: "http://localhost", depth: 0 });

		// THEN
		expect(result).toEqual({ ok: false, error: URL_NOT_ALLOWED });
	});

	it("reports the service as unavailable when the request cannot be sent", async () => {
		// GIVEN
		stubFetch(new TypeError("Failed to fetch"));

		// WHEN
		const result = await getScan(SCAN_ID);

		// THEN
		expect(result).toMatchObject({
			ok: false,
			error: { code: "WORKER_UNAVAILABLE" },
		});
	});

	it("reports an internal error when the response body is not recognised", async () => {
		// GIVEN
		stubFetch(Response.json({ unexpected: true }, { status: 500 }));

		// WHEN
		const result = await getScan(SCAN_ID);

		// THEN
		expect(result).toMatchObject({
			ok: false,
			error: { code: "INTERNAL_ERROR" },
		});
	});

	it("reports an internal error when a successful response is not JSON", async () => {
		// GIVEN
		stubFetch(new Response("<html></html>", { status: 200 }));

		// WHEN
		const result = await getScan(SCAN_ID);

		// THEN
		expect(result).toMatchObject({
			ok: false,
			error: { code: "INTERNAL_ERROR" },
		});
	});
});

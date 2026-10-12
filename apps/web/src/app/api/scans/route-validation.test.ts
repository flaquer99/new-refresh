import {
	INVALID_DEPTH_MESSAGE,
	INVALID_URL_MESSAGE,
} from "@refresh/scan-contracts/scan-request";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { SCAN_ID, startScanRequest } from "@/testing/scan-route-requests";
import { stubWorker } from "@/testing/stub-worker";
import { POST } from "./route";

vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

describe("POST /api/scans validation", () => {
	useFakeScanStore();

	beforeEach(() => {
		vi.spyOn(crypto, "randomUUID").mockReturnValue(SCAN_ID);
	});

	it("rejects an invalid URL with 400 INVALID_REQUEST", async () => {
		// GIVEN
		stubWorker(201, { scanId: SCAN_ID });

		// WHEN
		const response = await POST(
			startScanRequest({ url: "ftp://example.org", depth: 0 }),
		);

		// THEN
		expect({ status: response.status, body: await response.json() }).toEqual({
			status: 400,
			body: {
				error: { code: "INVALID_REQUEST", message: INVALID_URL_MESSAGE },
			},
		});
	});

	it("rejects an out-of-range depth with the depth message", async () => {
		// GIVEN
		stubWorker(201, { scanId: SCAN_ID });

		// WHEN
		const response = await POST(
			startScanRequest({ url: "https://www.example.org/", depth: 4 }),
		);

		// THEN
		expect((await response.json()).error.message).toBe(INVALID_DEPTH_MESSAGE);
	});

	it("does not call the worker when the request is invalid", async () => {
		// GIVEN
		const calls = stubWorker(201, { scanId: SCAN_ID });

		// WHEN
		await POST(startScanRequest({ url: "https://www.example.org/", depth: 4 }));

		// THEN
		expect(calls).toEqual([]);
	});

	it("rejects a body that is not JSON with 400 INVALID_REQUEST", async () => {
		// GIVEN
		stubWorker(201, { scanId: SCAN_ID });

		// WHEN
		const response = await POST(startScanRequest("{not json"));

		// THEN
		expect({ status: response.status, body: await response.json() }).toEqual({
			status: 400,
			body: {
				error: {
					code: "INVALID_REQUEST",
					message: "Send a JSON body with a url and a depth to start a scan.",
				},
			},
		});
	});

	it("forwards the trimmed URL to the worker", async () => {
		// GIVEN
		const calls = stubWorker(201, { scanId: SCAN_ID });

		// WHEN
		await POST(
			startScanRequest({ url: "  https://www.example.org/  ", depth: 0 }),
		);

		// THEN
		expect(calls[0]?.body).toEqual({
			scanId: SCAN_ID,
			url: "https://www.example.org/",
			depth: 0,
		});
	});
});

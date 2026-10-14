import { describe, expect, it } from "vitest";
import { jsonResponse, loadedPreview } from "@/testing/preview-fixtures";
import { stubFetch } from "@/testing/stub-fetch";
import { getFindingPreview, previewPath } from "./preview-api";

describe("previewPath", () => {
	it("builds the preview endpoint path with encoded ids", () => {
		// GIVEN / WHEN
		const path = previewPath("scan 1", "a/b");

		// THEN
		expect(path).toBe("/api/scans/scan%201/findings/a%2Fb/preview");
	});
});

describe("getFindingPreview", () => {
	it("returns the parsed preview and forwards the abort signal", async () => {
		// GIVEN
		const fetchMock = stubFetch(jsonResponse(loadedPreview()));
		const controller = new AbortController();

		// WHEN
		const result = await getFindingPreview({
			scanId: "s",
			findingId: "f",
			signal: controller.signal,
		});

		// THEN
		expect(result).toEqual({ ok: true, data: loadedPreview() });
		expect(fetchMock.mock.calls[0]?.[1]?.signal).toBe(controller.signal);
	});

	it("returns the API error for a failed response", async () => {
		// GIVEN
		const error = { code: "FINDING_NOT_FOUND", message: "Gone." };
		stubFetch(jsonResponse({ error }, 404));

		// WHEN
		const result = await getFindingPreview({
			scanId: "s",
			findingId: "f",
			signal: new AbortController().signal,
		});

		// THEN
		expect(result).toEqual({ ok: false, error });
	});
});

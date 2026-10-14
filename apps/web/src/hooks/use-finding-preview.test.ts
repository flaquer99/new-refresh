import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { jsonResponse, loadedPreview } from "@/testing/preview-fixtures";
import { stubFetch } from "@/testing/stub-fetch";
import { useFindingPreview } from "./use-finding-preview";

const PARAMS = { scanId: "scan-1", findingId: "finding-1" };

describe("useFindingPreview", () => {
	it("starts loading and resolves to the preview", async () => {
		// GIVEN
		stubFetch(jsonResponse(loadedPreview()));

		// WHEN
		const { result } = renderHook(() => useFindingPreview(PARAMS));

		// THEN
		expect(result.current).toBe("loading");
		await waitFor(() =>
			expect(result.current).toEqual({ ok: true, data: loadedPreview() }),
		);
	});

	it("aborts the request on unmount", () => {
		// GIVEN
		const fetchMock = stubFetch(jsonResponse(loadedPreview()));
		const { unmount } = renderHook(() => useFindingPreview(PARAMS));
		const signal = fetchMock.mock.calls[0]?.[1]?.signal;

		// WHEN
		unmount();

		// THEN
		expect(signal?.aborted).toBe(true);
	});
});

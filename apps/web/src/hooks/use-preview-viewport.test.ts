import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePreviewViewport } from "./use-preview-viewport";

describe("usePreviewViewport", () => {
	it("defaults to desktop when both viewports exist", () => {
		// GIVEN / WHEN
		const { result } = renderHook(() =>
			usePreviewViewport(["mobile", "desktop"]),
		);

		// THEN
		expect(result.current.viewport).toBe("desktop");
		expect(result.current.options).toEqual(["desktop", "mobile"]);
	});

	it("defaults to the only viewport otherwise", () => {
		// GIVEN / WHEN
		const { result } = renderHook(() => usePreviewViewport(["mobile"]));

		// THEN
		expect(result.current.viewport).toBe("mobile");
		expect(result.current.options).toEqual(["mobile"]);
	});

	it("switches to the selected viewport", () => {
		// GIVEN
		const { result } = renderHook(() =>
			usePreviewViewport(["desktop", "mobile"]),
		);

		// WHEN
		act(() => {
			result.current.select("mobile");
		});

		// THEN
		expect(result.current.viewport).toBe("mobile");
	});
});

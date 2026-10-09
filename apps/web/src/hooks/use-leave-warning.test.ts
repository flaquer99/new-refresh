import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useLeaveWarning } from "./use-leave-warning";

const dispatchBeforeUnload = (): Event => {
	const event = new Event("beforeunload", { cancelable: true });
	window.dispatchEvent(event);
	return event;
};

describe("useLeaveWarning", () => {
	it("asks for confirmation before unloading while active", () => {
		// GIVEN
		renderHook(() => useLeaveWarning(true));

		// WHEN
		const event = dispatchBeforeUnload();

		// THEN
		expect(event.defaultPrevented).toBe(true);
	});

	it("does not add a beforeunload listener while inactive", () => {
		// GIVEN
		const addSpy = vi.spyOn(window, "addEventListener");

		// WHEN
		renderHook(() => useLeaveWarning(false));

		// THEN
		const added = addSpy.mock.calls.filter(([type]) => type === "beforeunload");
		expect(added).toHaveLength(0);
	});

	it("removes the listener on unmount", () => {
		// GIVEN
		const { unmount } = renderHook(() => useLeaveWarning(true));

		// WHEN
		unmount();
		const event = dispatchBeforeUnload();

		// THEN
		expect(event.defaultPrevented).toBe(false);
	});

	it("removes the listener when it becomes inactive", () => {
		// GIVEN
		const { rerender } = renderHook(({ active }) => useLeaveWarning(active), {
			initialProps: { active: true },
		});

		// WHEN
		rerender({ active: false });
		const event = dispatchBeforeUnload();

		// THEN
		expect(event.defaultPrevented).toBe(false);
	});
});

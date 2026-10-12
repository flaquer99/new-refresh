import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDeleteDialog } from "./use-delete-dialog";

describe("useDeleteDialog", () => {
	it("opens and restores focus by default", () => {
		// GIVEN
		const { result } = renderHook(() => useDeleteDialog());

		// WHEN
		act(() => result.current.onOpenChange(true));

		// THEN
		expect([result.current.open, result.current.restoresFocus]).toEqual([
			true,
			true,
		]);
	});

	it("closes and keeps restoring focus when cancelled", () => {
		// GIVEN
		const { result } = renderHook(() => useDeleteDialog());
		act(() => result.current.onOpenChange(true));

		// WHEN
		act(() => result.current.onOpenChange(false));

		// THEN
		expect([result.current.open, result.current.restoresFocus]).toEqual([
			false,
			true,
		]);
	});

	it("closes without restoring focus after a delete", () => {
		// GIVEN
		const { result } = renderHook(() => useDeleteDialog());
		act(() => result.current.onOpenChange(true));

		// WHEN
		act(() => result.current.markDeleted());

		// THEN
		expect([result.current.open, result.current.restoresFocus]).toEqual([
			false,
			false,
		]);
	});

	it("restores focus again when reopened after a delete", () => {
		// GIVEN
		const { result } = renderHook(() => useDeleteDialog());
		act(() => result.current.markDeleted());

		// WHEN
		act(() => result.current.onOpenChange(true));

		// THEN
		expect(result.current.restoresFocus).toBe(true);
	});
});

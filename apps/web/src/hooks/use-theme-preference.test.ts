import { renderHook } from "@testing-library/react";
import { useTheme } from "next-themes";
import { describe, expect, it, vi } from "vitest";
import { useThemePreference } from "./use-theme-preference";

vi.mock("next-themes", () => ({ useTheme: vi.fn() }));

const mockTheme = (theme: string | undefined) => {
	vi.mocked(useTheme).mockReturnValue({
		theme,
		setTheme: vi.fn(),
		themes: ["light", "dark"],
	});
};

describe("useThemePreference", () => {
	it("returns the stored preference once hydrated", () => {
		// GIVEN
		mockTheme("dark");

		// WHEN
		const { result } = renderHook(() => useThemePreference());

		// THEN
		expect(result.current.preference).toBe("dark");
	});

	it("maps an unknown theme to system", () => {
		// GIVEN
		mockTheme("sepia");

		// WHEN
		const { result } = renderHook(() => useThemePreference());

		// THEN
		expect(result.current.preference).toBe("system");
	});

	it("maps a missing theme to system", () => {
		// GIVEN
		mockTheme(undefined);

		// WHEN
		const { result } = renderHook(() => useThemePreference());

		// THEN
		expect(result.current.preference).toBe("system");
	});
});

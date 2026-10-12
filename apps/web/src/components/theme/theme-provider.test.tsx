import { act, renderHook } from "@testing-library/react";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { THEME_STORAGE_KEY } from "@/lib/theme/theme-options";
import { ThemeProvider } from "./theme-provider";

const wrapper = ({ children }: { children: ReactNode }) => (
	<ThemeProvider>{children}</ThemeProvider>
);

describe("ThemeProvider", () => {
	afterEach(() => {
		window.localStorage.clear();
		document.documentElement.className = "";
	});

	it("starts on the system preference", () => {
		// WHEN
		const { result } = renderHook(() => useTheme(), { wrapper });

		// THEN
		expect(result.current.theme).toBe("system");
	});

	it("stores the choice under the refresh-theme key and applies the class", () => {
		// GIVEN
		const { result } = renderHook(() => useTheme(), { wrapper });

		// WHEN
		act(() => result.current.setTheme("dark"));

		// THEN
		expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});

	it("applies no dark class when storage holds an unknown value", () => {
		// GIVEN
		window.localStorage.setItem(THEME_STORAGE_KEY, "sepia");

		// WHEN
		renderHook(() => useTheme(), { wrapper });

		// THEN
		expect(document.documentElement.classList.contains("dark")).toBe(false);
	});
});

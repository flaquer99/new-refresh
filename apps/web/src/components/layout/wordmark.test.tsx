import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { describe, expect, it, vi } from "vitest";
import { SiteHeader } from "./site-header";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));
vi.mock("next-themes", () => ({ useTheme: vi.fn() }));

describe("SiteHeader wordmark", () => {
	it("links the wordmark to the form outside the main navigation", () => {
		// GIVEN
		vi.mocked(usePathname).mockReturnValue("/scans");
		vi.mocked(useTheme).mockReturnValue({
			theme: "light",
			setTheme: vi.fn(),
			themes: ["light", "dark"],
		});

		// WHEN
		render(<SiteHeader />);

		// THEN
		const wordmark = screen.getByRole("link", { name: /Refresh/ });
		const nav = screen.getByRole("navigation", { name: "Main" });
		expect(wordmark.getAttribute("href")).toBe("/");
		expect(wordmark.textContent).toContain("by 99x");
		expect(nav.contains(wordmark)).toBe(false);
	});
});

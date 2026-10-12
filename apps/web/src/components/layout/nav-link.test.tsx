import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { describe, expect, it, vi } from "vitest";
import { SiteHeader } from "./site-header";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

const currentLinks = () =>
	screen
		.getAllByRole("link")
		.filter((link) => link.getAttribute("aria-current") === "page")
		.map((link) => link.textContent);

describe("SiteHeader navigation", () => {
	it("marks Scan history as the current page on the history route", () => {
		// GIVEN
		vi.mocked(usePathname).mockReturnValue("/scans");

		// WHEN
		render(<SiteHeader />);

		// THEN
		expect(currentLinks()).toEqual(["Scan history"]);
	});

	it("marks New scan as the current page on the form route", () => {
		// GIVEN
		vi.mocked(usePathname).mockReturnValue("/");

		// WHEN
		render(<SiteHeader />);

		// THEN
		expect(currentLinks()).toEqual(["New scan"]);
	});

	it("marks no link as current on a scan link", () => {
		// GIVEN
		vi.mocked(usePathname).mockReturnValue(
			"/scans/8f0c6b8e-3a8e-4d0b-9a57-2f5a1d6f4c11",
		);

		// WHEN
		render(<SiteHeader />);

		// THEN
		expect(currentLinks()).toEqual([]);
	});

	it("exposes both destinations in the main navigation", () => {
		// GIVEN
		vi.mocked(usePathname).mockReturnValue("/");

		// WHEN
		render(<SiteHeader />);

		// THEN
		const nav = screen.getByRole("navigation", { name: "Main" });
		expect(
			[...nav.querySelectorAll("a")].map((link) => link.getAttribute("href")),
		).toEqual(["/", "/scans"]);
	});
});

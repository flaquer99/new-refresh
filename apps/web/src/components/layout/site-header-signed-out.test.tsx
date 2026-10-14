import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetClerkView } from "@/testing/clerk-components";
import { SiteHeader } from "./site-header";

vi.mock("@clerk/nextjs", async () => {
	const { clerkComponentsMock } = await import("@/testing/clerk-components");
	return clerkComponentsMock;
});
vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));
vi.mock("next-themes", () => ({ useTheme: vi.fn() }));

describe("SiteHeader when signed out", () => {
	beforeEach(() => {
		resetClerkView();
		vi.mocked(usePathname).mockReturnValue("/");
		vi.mocked(useTheme).mockReturnValue({
			theme: "system",
			setTheme: vi.fn(),
			themes: ["light", "dark"],
		});
	});

	it("hides the main navigation links", () => {
		// WHEN
		render(<SiteHeader />);

		// THEN
		expect(screen.queryByRole("navigation", { name: "Main" })).toBeNull();
	});

	it("offers Sign in and Sign up", () => {
		// WHEN
		render(<SiteHeader />);

		// THEN
		expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Sign up" })).toBeTruthy();
	});
});

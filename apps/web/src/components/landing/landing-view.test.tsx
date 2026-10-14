import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LandingView } from "./landing-view";

vi.mock("@clerk/nextjs", async () => {
	const { clerkComponentsMock } = await import("@/testing/clerk-components");
	return clerkComponentsMock;
});

describe("LandingView", () => {
	it("introduces the scanner under a level one heading", () => {
		// WHEN
		render(<LandingView />);

		// THEN
		expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
			"Find WCAG 2.2 issues across your whole site",
		);
	});

	it("offers Sign up and Sign in", () => {
		// WHEN
		render(<LandingView />);

		// THEN
		expect(screen.getByRole("button", { name: "Sign up" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy();
	});
});

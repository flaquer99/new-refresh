import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clerkView, resetClerkView } from "@/testing/clerk-components";
import { AuthControls } from "./auth-controls";

vi.mock("@clerk/nextjs", async () => {
	const { clerkComponentsMock: mock } = await import(
		"@/testing/clerk-components"
	);
	return mock;
});

describe("AuthControls", () => {
	beforeEach(() => {
		resetClerkView();
	});

	it("shows Sign in and Sign up buttons when signed out", () => {
		// GIVEN
		clerkView.signedIn = false;

		// WHEN
		render(<AuthControls />);

		// THEN
		expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Sign up" })).toBeTruthy();
	});

	it("hides the user menu when signed out", () => {
		// WHEN
		render(<AuthControls />);

		// THEN
		expect(screen.queryByTestId("user-button")).toBeNull();
	});

	it("shows the organization name and logo when signed in", () => {
		// GIVEN
		clerkView.signedIn = true;
		clerkView.organization = { name: "Acme Corp", imageUrl: "https://x/y.png" };

		// WHEN
		render(<AuthControls />);

		// THEN
		expect(screen.getByText("Acme Corp")).toBeTruthy();
		expect(screen.getByText("Organization:")).toBeTruthy();
	});

	it("shows the user menu with an organization settings link when signed in", () => {
		// GIVEN
		clerkView.signedIn = true;
		clerkView.organization = { name: "Acme Corp", imageUrl: "https://x/y.png" };

		// WHEN
		render(<AuthControls />);

		// THEN
		const item = screen.getByText("Organization settings");
		expect(item.getAttribute("data-href")).toBe("/organization");
	});

	it("hides Sign in and Sign up when signed in", () => {
		// GIVEN
		clerkView.signedIn = true;

		// WHEN
		render(<AuthControls />);

		// THEN
		expect(screen.queryByRole("button", { name: "Sign in" })).toBeNull();
	});

	it("renders no badge while the organization is not loaded", () => {
		// GIVEN
		clerkView.signedIn = true;

		// WHEN
		render(<AuthControls />);

		// THEN
		expect(screen.queryByText("Organization:")).toBeNull();
	});
});

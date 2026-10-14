import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthPageFrame } from "./auth-page-frame";

describe("AuthPageFrame", () => {
	it("labels the main landmark with the page title", () => {
		// WHEN
		render(
			<AuthPageFrame title="Sign in">
				<p>form</p>
			</AuthPageFrame>,
		);

		// THEN
		expect(screen.getByRole("main", { name: "Sign in" })).toBeTruthy();
	});

	it("renders its children", () => {
		// WHEN
		render(
			<AuthPageFrame title="Sign in">
				<p>form</p>
			</AuthPageFrame>,
		);

		// THEN
		expect(screen.getByText("form")).toBeTruthy();
	});
});

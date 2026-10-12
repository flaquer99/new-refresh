import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SkipLink } from "./skip-link";

describe("SkipLink", () => {
	it("targets the main landmark", () => {
		// GIVEN
		render(<SkipLink />);

		// THEN
		const link = screen.getByRole("link", { name: "Skip to main content" });
		expect(link.getAttribute("href")).toBe("#main-content");
	});
});

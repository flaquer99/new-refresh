import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyHistory } from "./empty-history";

describe("EmptyHistory", () => {
	it("explains that no scans exist yet", () => {
		// WHEN
		render(<EmptyHistory />);

		// THEN
		expect(screen.getByText(/No scans yet/)).not.toBeNull();
	});

	it("links to a new scan", () => {
		// WHEN
		render(<EmptyHistory />);

		// THEN
		expect(
			screen
				.getByRole("link", { name: "Start a new scan" })
				.getAttribute("href"),
		).toBe("/");
	});
});

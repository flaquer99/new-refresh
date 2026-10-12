import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyHistory } from "./empty-history";

describe("EmptyHistory", () => {
	it("explains that no scans exist yet", () => {
		// WHEN
		render(<EmptyHistory isPaged={false} />);

		// THEN
		expect(screen.queryAllByText(/No scans yet/)).toHaveLength(1);
	});

	it("links to a new scan", () => {
		// WHEN
		render(<EmptyHistory isPaged={false} />);

		// THEN
		expect(
			screen
				.getByRole("link", { name: "Start a new scan" })
				.getAttribute("href"),
		).toBe("/");
	});

	it("says there are no older scans on a later history page", () => {
		// WHEN
		render(<EmptyHistory isPaged={true} />);

		// THEN
		expect(screen.queryAllByText(/No older scans/)).toHaveLength(1);
	});
});

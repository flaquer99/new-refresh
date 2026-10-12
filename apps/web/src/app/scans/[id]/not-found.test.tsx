import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ScanNotFound from "./not-found";

describe("ScanNotFound", () => {
	it("names the page Scan not found", () => {
		// WHEN
		render(<ScanNotFound />);

		// THEN
		expect(
			screen.getAllByRole("heading", { level: 1, name: "Scan not found" }),
		).toHaveLength(1);
	});

	it("explains that the scan does not exist", () => {
		// WHEN
		render(<ScanNotFound />);

		// THEN
		expect(
			screen.queryAllByText(
				"This scan doesn't exist. It may have been deleted.",
			),
		).toHaveLength(1);
	});

	it("links to a new scan", () => {
		// WHEN
		render(<ScanNotFound />);

		// THEN
		expect(
			screen
				.getByRole("link", { name: "Start a new scan" })
				.getAttribute("href"),
		).toBe("/");
	});

	it("links to the scan history", () => {
		// WHEN
		render(<ScanNotFound />);

		// THEN
		expect(
			screen.getByRole("link", { name: "Scan history" }).getAttribute("href"),
		).toBe("/scans");
	});
});

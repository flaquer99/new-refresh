import { SCAN_INTERRUPTED_MESSAGE } from "@refresh/scan-contracts/errors";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { START_URL } from "@/testing/finding-fixtures";
import { ScanFailure } from "./scan-failure";

const INTERRUPTED = {
	code: "SCAN_INTERRUPTED" as const,
	message: SCAN_INTERRUPTED_MESSAGE,
};

describe("ScanFailure", () => {
	it("shows why the scan failed", () => {
		// WHEN
		render(<ScanFailure depth={1} error={INTERRUPTED} startUrl={START_URL} />);

		// THEN
		expect(screen.queryAllByText(SCAN_INTERRUPTED_MESSAGE)).toHaveLength(1);
	});

	it("keeps the region named The scan couldn't finish", () => {
		// WHEN
		render(<ScanFailure depth={1} error={INTERRUPTED} startUrl={START_URL} />);

		// THEN
		expect(
			screen.getAllByRole("region", { name: "The scan couldn't finish" }),
		).toHaveLength(1);
	});

	it("links to the scan history", () => {
		// WHEN
		render(<ScanFailure depth={1} error={INTERRUPTED} startUrl={START_URL} />);

		// THEN
		expect(
			screen
				.getByRole("link", { name: "View scan history" })
				.getAttribute("href"),
		).toBe("/scans");
	});

	it("links Run again to the form prefilled with the same url and depth", () => {
		// WHEN
		render(<ScanFailure depth={1} error={INTERRUPTED} startUrl={START_URL} />);

		// THEN
		expect(
			screen.getByRole("link", { name: "Run again" }).getAttribute("href"),
		).toBe("/?url=https%3A%2F%2Fwww.example.org%2F&depth=1");
	});
});

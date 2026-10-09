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
		expect(screen.getByText(SCAN_INTERRUPTED_MESSAGE)).not.toBeNull();
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

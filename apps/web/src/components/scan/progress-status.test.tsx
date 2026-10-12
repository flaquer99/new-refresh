import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressStatus } from "./progress-status";

const PROGRESS = {
	pagesScanned: 3,
	pagesDiscovered: 12,
	currentUrl: "https://www.example.org/about",
};

describe("ProgressStatus", () => {
	it("sets the bar to the share of discovered pages scanned", () => {
		// GIVEN / WHEN
		render(<ProgressStatus progress={PROGRESS} />);

		// THEN
		const bar = screen.getByRole("progressbar", { name: "Pages scanned" });
		expect(bar.getAttribute("aria-valuenow")).toBe("25");
	});

	it("caps the bar at 100 when more pages are scanned than discovered", () => {
		// GIVEN / WHEN
		render(
			<ProgressStatus
				progress={{ ...PROGRESS, pagesScanned: 13, pagesDiscovered: 12 }}
			/>,
		);

		// THEN
		const bar = screen.getByRole("progressbar", { name: "Pages scanned" });
		expect(bar.getAttribute("aria-valuenow")).toBe("100");
	});

	it("leaves the bar indeterminate before any page is discovered", () => {
		// GIVEN / WHEN
		render(
			<ProgressStatus
				progress={{ pagesScanned: 0, pagesDiscovered: 0, currentUrl: null }}
			/>,
		);

		// THEN
		const bar = screen.getByRole("progressbar", { name: "Pages scanned" });
		expect(bar.hasAttribute("aria-valuenow")).toBe(false);
	});
});

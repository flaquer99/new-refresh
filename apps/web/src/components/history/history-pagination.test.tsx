import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HistoryPagination } from "./history-pagination";

const CURSOR = "MjAyNi0xMC0wOVQxMTo1NTowMC4wMDBafDhmMGM";

const linkNames = () =>
	screen.queryAllByRole("link").map((link) => link.textContent);

describe("HistoryPagination", () => {
	it("links to older scans from the first page", () => {
		// WHEN
		render(<HistoryPagination isPaged={false} nextBefore={CURSOR} />);

		// THEN
		expect(
			screen.getByRole("link", { name: "Older scans" }).getAttribute("href"),
		).toBe(`/scans?before=${CURSOR}`);
	});

	it("links back to the newest scans from an older page", () => {
		// WHEN
		render(<HistoryPagination isPaged nextBefore={CURSOR} />);

		// THEN
		expect(linkNames()).toEqual(["Newest scans", "Older scans"]);
	});

	it("offers only the newest scans on the last page", () => {
		// WHEN
		render(<HistoryPagination isPaged nextBefore={null} />);

		// THEN
		expect(linkNames()).toEqual(["Newest scans"]);
	});

	it("renders nothing when everything fits on one page", () => {
		// WHEN
		render(<HistoryPagination isPaged={false} nextBefore={null} />);

		// THEN
		expect(screen.queryByRole("navigation")).toBeNull();
	});
});

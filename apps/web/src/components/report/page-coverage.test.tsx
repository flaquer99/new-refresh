import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { START_URL } from "@/testing/finding-fixtures";
import { PageCoverage } from "./page-coverage";

const pages = [
	{
		url: START_URL,
		depth: 0,
		status: "scanned",
		reason: null,
		httpStatus: 200,
	},
	{
		url: `${START_URL}brochure.pdf`,
		depth: 1,
		status: "skipped",
		reason: "not-html",
		httpStatus: 200,
	},
	{
		url: `${START_URL}private/x`,
		depth: 1,
		status: "skipped",
		reason: "robots-disallowed",
		httpStatus: null,
	},
	{
		url: `${START_URL}missing`,
		depth: 1,
		status: "failed",
		reason: "http-error",
		httpStatus: 404,
	},
] as const;

const itemsUnder = (heading: string): string[] => {
	const list = screen.getByRole("heading", {
		name: heading,
	}).nextElementSibling;
	return [...(list?.querySelectorAll("li") ?? [])].map(
		({ textContent }) => textContent ?? "",
	);
};

describe("PageCoverage", () => {
	it("lists scanned pages", () => {
		// GIVEN / WHEN
		render(<PageCoverage pages={[...pages]} />);

		// THEN
		expect(itemsUnder("Scanned (1)")).toEqual([START_URL]);
	});

	it("lists skipped pages with the reason", () => {
		// GIVEN / WHEN
		render(<PageCoverage pages={[...pages]} />);

		// THEN
		expect(itemsUnder("Skipped (2)")).toEqual([
			`${START_URL}brochure.pdfNot an HTML page`,
			`${START_URL}private/xDisallowed by robots.txt`,
		]);
	});

	it("lists failed pages with the reason", () => {
		// GIVEN / WHEN
		render(<PageCoverage pages={[...pages]} />);

		// THEN
		expect(itemsUnder("Failed (1)")).toEqual([
			`${START_URL}missingHTTP 404 error`,
		]);
	});

	it("omits a status with no pages", () => {
		// GIVEN / WHEN
		render(<PageCoverage pages={[pages[0]]} />);

		// THEN
		expect(screen.queryByRole("heading", { name: /Failed/ })).toBeNull();
	});
});

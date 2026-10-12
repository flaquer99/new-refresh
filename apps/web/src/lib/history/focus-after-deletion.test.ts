import { afterEach, describe, expect, it } from "vitest";
import { scanLinkPath } from "@/lib/scans/scan-links";
import { focusAfterDeletion } from "./focus-after-deletion";

const HEADING_ID = "history-heading";
const FIRST = "11111111-1111-4111-8111-111111111111";
const MIDDLE = "22222222-2222-4222-8222-222222222222";
const LAST = "33333333-3333-4333-8333-333333333333";

const renderHistory = (scanIds: readonly string[]) => {
	const items = scanIds
		.map(
			(scanId) =>
				`<li><article><h2><a href="${scanLinkPath(scanId)}">${scanId}</a></h2><button type="button">Delete</button></article></li>`,
		)
		.join("");
	document.body.innerHTML = `<h1 id="${HEADING_ID}" tabindex="-1">Scan history</h1><ol>${items}</ol>`;
};

const focusedHref = () => document.activeElement?.getAttribute("href");

afterEach(() => {
	document.body.innerHTML = "";
});

describe("focusAfterDeletion", () => {
	it("focuses the link of the entry after the deleted one", () => {
		// GIVEN
		renderHistory([FIRST, MIDDLE, LAST]);

		// WHEN
		focusAfterDeletion({ scanId: MIDDLE, fallbackId: HEADING_ID });

		// THEN
		expect(focusedHref()).toBe(scanLinkPath(LAST));
	});

	it("focuses the link of the entry before when the last entry was deleted", () => {
		// GIVEN
		renderHistory([FIRST, MIDDLE, LAST]);

		// WHEN
		focusAfterDeletion({ scanId: LAST, fallbackId: HEADING_ID });

		// THEN
		expect(focusedHref()).toBe(scanLinkPath(MIDDLE));
	});

	it("focuses the history heading when the deleted entry was the only one", () => {
		// GIVEN
		renderHistory([FIRST]);

		// WHEN
		focusAfterDeletion({ scanId: FIRST, fallbackId: HEADING_ID });

		// THEN
		expect(document.activeElement?.id).toBe(HEADING_ID);
	});

	it("focuses the history heading when the deleted entry is no longer on the page", () => {
		// GIVEN
		renderHistory([FIRST]);

		// WHEN
		focusAfterDeletion({ scanId: LAST, fallbackId: HEADING_ID });

		// THEN
		expect(document.activeElement?.id).toBe(HEADING_ID);
	});
});

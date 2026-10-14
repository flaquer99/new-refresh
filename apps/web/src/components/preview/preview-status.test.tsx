import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
	HighlightState,
	PreviewStatusValue,
} from "@/lib/preview/preview-messages";
import { PreviewStatus } from "./preview-status";

const highlight = (
	outcome: HighlightState["outcome"],
	matchCount = 1,
): PreviewStatusValue => ({
	kind: "highlight",
	state: { outcome, matchCount },
});

const renderStatus = (status: PreviewStatusValue) => {
	render(<PreviewStatus status={status} />);
	return screen.getByRole("status").textContent;
};

describe("PreviewStatus", () => {
	it.each([
		["loading", "Loading live page…"],
		["highlighted", "Element highlighted."],
		[
			"not-found",
			"The element was not found. The page may have changed since this scan.",
		],
		["hidden", "The element is on the page but not visible on screen."],
		[
			"unsupported-selector",
			"Highlighting inside embedded content (frames or shadow DOM) isn't supported.",
		],
		[
			"no-response",
			"The page loaded, but the element couldn't be highlighted.",
		],
	] as const)("renders the %s copy in a status region", (outcome, copy) => {
		// GIVEN / WHEN
		const text = renderStatus(highlight(outcome));

		// THEN
		expect(text).toBe(copy);
	});

	it("adds the multiple-matches note when the selector matches several elements", () => {
		// GIVEN / WHEN
		const text = renderStatus(highlight("highlighted", 3));

		// THEN
		expect(text).toBe(
			"Element highlighted. This selector matches 3 elements; the first is highlighted.",
		);
	});
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { buildReviewItem, buildViolation } from "@/testing/finding-fixtures";
import { jsonResponse, loadedPreview } from "@/testing/preview-fixtures";
import { stubFetch } from "@/testing/stub-fetch";
import { ReviewItemCard } from "./review-item-card";
import { ViolationCard } from "./violation-card";

const violation = buildViolation();
const item = buildReviewItem();

const openPreview = async () => {
	await userEvent.click(screen.getByRole("button", { name: "Show preview" }));
	await screen.findByTitle(/Live preview of/);
};

describe("finding cards with the preview open", () => {
	it("keeps every FindingDetails field on a violation card", async () => {
		// GIVEN
		stubFetch(jsonResponse(loadedPreview()));
		render(<ViolationCard scanId="scan-1" violation={violation} />);

		// WHEN
		await openPreview();

		// THEN
		const text = screen.getByRole("article").textContent;
		expect(text).toContain(violation.pageUrl);
		expect(text).toContain(violation.selector);
		expect(text).toContain(violation.html);
		expect(text).toContain("Desktop (1280 px), Mobile (320 px)");
	});

	it("keeps every FindingDetails field on a review item card", async () => {
		// GIVEN
		stubFetch(jsonResponse(loadedPreview()));
		render(<ReviewItemCard item={item} scanId="scan-1" />);

		// WHEN
		await openPreview();

		// THEN
		const text = screen.getByRole("article").textContent;
		expect(text).toContain(item.pageUrl);
		expect(text).toContain(item.selector);
		expect(text).toContain(item.html);
		expect(text).toContain("Desktop (1280 px)");
	});

	it("requests the preview for the review item id", async () => {
		// GIVEN
		const fetchMock = stubFetch(jsonResponse(loadedPreview()));
		render(<ReviewItemCard item={item} scanId="scan-1" />);

		// WHEN
		await openPreview();

		// THEN
		expect(fetchMock.mock.calls[0]?.[0]).toBe(
			`/api/scans/scan-1/findings/${item.id}/preview`,
		);
	});

	it("describes the preview button by the card heading", () => {
		// GIVEN / WHEN
		render(<ReviewItemCard item={item} scanId="scan-1" />);

		// THEN
		const button = screen.getByRole("button", { name: "Show preview" });
		expect(button.getAttribute("aria-describedby")).toBe(`review-${item.id}`);
	});
});

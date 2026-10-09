import { describe, expect, it } from "vitest";
import { describePageReason, formatViewports, OUTCOME_LABELS } from "./labels";

const PDF_URL = "https://www.example.org/brochure.pdf";

describe("report labels", () => {
	it("names viewports with their width", () => {
		// GIVEN / WHEN
		const label = formatViewports(["desktop", "mobile"]);

		// THEN
		expect(label).toBe("Desktop (1280 px), Mobile (320 px)");
	});

	it("marks a cancelled outcome as partial", () => {
		// GIVEN / WHEN
		const label = OUTCOME_LABELS.cancelled;

		// THEN
		expect(label).toBe("Partial — cancelled");
	});

	it("describes an HTTP error with its status code", () => {
		// GIVEN
		const page = {
			url: PDF_URL,
			depth: 1,
			status: "failed",
			reason: "http-error",
			httpStatus: 404,
		} as const;

		// WHEN
		const description = describePageReason(page);

		// THEN
		expect(description).toBe("HTTP 404 error");
	});

	it("describes a skipped page with its reason", () => {
		// GIVEN
		const page = {
			url: PDF_URL,
			depth: 1,
			status: "skipped",
			reason: "not-html",
			httpStatus: 200,
		} as const;

		// WHEN
		const description = describePageReason(page);

		// THEN
		expect(description).toBe("Not an HTML page");
	});

	it("describes a scanned page without a reason", () => {
		// GIVEN
		const page = {
			url: PDF_URL,
			depth: 0,
			status: "scanned",
			reason: null,
			httpStatus: 200,
		} as const;

		// WHEN
		const description = describePageReason(page);

		// THEN
		expect(description).toBe("Scanned");
	});
});

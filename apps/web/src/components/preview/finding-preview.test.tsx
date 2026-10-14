import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { START_URL } from "@/testing/finding-fixtures";
import {
	jsonResponse,
	loadedPreview,
	PREVIEW_SCAN_ID,
} from "@/testing/preview-fixtures";
import { stubFetch } from "@/testing/stub-fetch";
import { FindingPreview } from "./finding-preview";

const renderPreview = () =>
	render(
		<>
			<h4 id="heading-1">Finding</h4>
			<FindingPreview
				findingId="finding-1"
				headingId="heading-1"
				pageUrl={START_URL}
				scanId={PREVIEW_SCAN_ID}
				viewports={["desktop", "mobile"]}
			/>
		</>,
	);

describe("FindingPreview", () => {
	it("makes no request until Show preview is activated", () => {
		// GIVEN
		const fetchMock = stubFetch(jsonResponse(loadedPreview()));

		// WHEN
		renderPreview();

		// THEN
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("requests the preview once Show preview is activated", async () => {
		// GIVEN
		const fetchMock = stubFetch(jsonResponse(loadedPreview()));
		renderPreview();

		// WHEN
		await userEvent.click(screen.getByRole("button", { name: "Show preview" }));

		// THEN
		expect(fetchMock.mock.calls[0]?.[0]).toBe(
			"/api/scans/scan-1/findings/finding-1/preview",
		);
	});

	it("toggles aria-expanded and the label between Show and Hide", async () => {
		// GIVEN
		stubFetch(jsonResponse(loadedPreview()));
		renderPreview();
		const button = screen.getByRole("button", { name: "Show preview" });

		// WHEN
		await userEvent.click(button);

		// THEN
		expect(button.getAttribute("aria-expanded")).toBe("true");
		expect(button.textContent).toBe("Hide preview");
		expect(button.getAttribute("aria-describedby")).toBe("heading-1");
		expect(button.getAttribute("aria-controls")).not.toBeNull();
	});

	it("aborts the request when the preview is closed", async () => {
		// GIVEN
		const fetchMock = stubFetch(jsonResponse(loadedPreview()));
		renderPreview();
		const button = screen.getByRole("button", { name: "Show preview" });
		await userEvent.click(button);
		const signal = fetchMock.mock.calls[0]?.[1]?.signal;

		// WHEN
		await userEvent.click(button);

		// THEN
		expect(signal?.aborted).toBe(true);
	});
});

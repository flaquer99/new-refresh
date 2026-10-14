import type { Viewport } from "@refresh/scan-contracts/findings";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { START_URL } from "@/testing/finding-fixtures";
import { loadedPreview } from "@/testing/preview-fixtures";
import { PreviewLoaded } from "./preview-loaded";

const renderLoaded = (viewports: Viewport[], finalUrl = START_URL) => {
	const preview = loadedPreview({ finalUrl });
	if (preview.kind !== "loaded") {
		throw new Error("fixture must be loaded");
	}
	render(
		<PreviewLoaded
			frameRef={{ current: null }}
			preview={preview}
			viewports={viewports}
		/>,
	);
	return screen.getByTitle(`Live preview of ${START_URL}`);
};

describe("PreviewLoaded", () => {
	it("shows the viewport switch only for findings seen at both viewports", () => {
		// GIVEN / WHEN
		renderLoaded(["desktop", "mobile"]);

		// THEN
		const buttons = screen.getAllByRole("button");
		expect(buttons.map((button) => button.textContent)).toEqual([
			"Desktop",
			"Mobile",
		]);
		expect(buttons[0]?.getAttribute("aria-pressed")).toBe("true");
	});

	it("hides the viewport switch for a single-viewport finding", () => {
		// GIVEN / WHEN
		renderLoaded(["mobile"]);

		// THEN
		expect(screen.queryByRole("button")).toBeNull();
		expect(screen.getByText("Mobile (320 px)")).not.toBeNull();
	});

	it("resizes the frame when switching viewports", async () => {
		// GIVEN
		const frame = renderLoaded(["desktop", "mobile"]);

		// WHEN
		await userEvent.click(screen.getByRole("button", { name: /Mobile/ }));

		// THEN
		expect(frame.style.width).toBe("320px");
		expect(
			screen
				.getByRole("button", { name: /Mobile/ })
				.getAttribute("aria-pressed"),
		).toBe("true");
	});

	it("shows the loaded URL without a redirect note when nothing redirected", () => {
		// GIVEN / WHEN
		renderLoaded(["desktop"]);

		// THEN
		expect(screen.getByText(START_URL)).not.toBeNull();
		expect(screen.queryByText(/Redirected to/)).toBeNull();
	});

	it("notes the final URL when the page redirected", () => {
		// GIVEN / WHEN
		renderLoaded(["desktop"], "https://www.example.org/landing");

		// THEN
		expect(screen.getByText(/Redirected to/).textContent).toContain(
			"https://www.example.org/landing",
		);
	});
});

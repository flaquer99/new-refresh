import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { START_URL } from "@/testing/finding-fixtures";
import { PreviewUnavailable } from "./preview-unavailable";

describe("PreviewUnavailable", () => {
	it("keeps the open-in-new-tab link with rel noopener noreferrer", () => {
		// GIVEN / WHEN
		render(<PreviewUnavailable pageUrl={START_URL} />);

		// THEN
		const link = screen.getByRole("link", { name: /Open page in new tab/ });
		expect(link.getAttribute("href")).toBe(START_URL);
		expect(link.getAttribute("target")).toBe("_blank");
		expect(link.getAttribute("rel")).toBe("noopener noreferrer");
	});

	it("offers no retry without a handler", () => {
		// GIVEN / WHEN
		render(<PreviewUnavailable pageUrl={START_URL} />);

		// THEN
		expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
	});

	it("calls the handler when Try again is activated", async () => {
		// GIVEN
		const onRetry = vi.fn();
		render(<PreviewUnavailable onRetry={onRetry} pageUrl={START_URL} />);

		// WHEN
		await userEvent.click(screen.getByRole("button", { name: "Try again" }));

		// THEN
		expect(onRetry).toHaveBeenCalledTimes(1);
	});
});

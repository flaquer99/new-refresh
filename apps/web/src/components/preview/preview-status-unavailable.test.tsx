import { PREVIEW_UNAVAILABLE_REASONS } from "@refresh/scan-contracts/preview";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PreviewStatusValue } from "@/lib/preview/preview-messages";
import { PreviewStatus } from "./preview-status";

const renderStatus = (status: PreviewStatusValue) => {
	render(<PreviewStatus status={status} />);
	return screen.getByRole("status").textContent;
};

describe("PreviewStatus unavailable copy", () => {
	it("states the HTTP status for an http-error", () => {
		// GIVEN / WHEN
		const text = renderStatus({
			kind: "unavailable",
			reason: "http-error",
			httpStatus: 404,
		});

		// THEN
		expect(text).toBe("Preview unavailable: the page returned HTTP 404.");
	});

	it("renders distinct unavailable copy for every other reason", () => {
		// GIVEN
		const reasons = PREVIEW_UNAVAILABLE_REASONS.filter(
			(reason) => reason !== "http-error",
		);

		// WHEN
		const copies = reasons.map((reason) => {
			const { unmount } = render(
				<PreviewStatus
					status={{ kind: "unavailable", reason, httpStatus: null }}
				/>,
			);
			const text = screen.getByRole("status").textContent;
			unmount();
			return text;
		});

		// THEN
		expect(new Set(copies).size).toBe(reasons.length);
		for (const copy of copies) {
			expect(copy).toMatch(/^Preview unavailable: /);
		}
	});

	it("renders the scanner-unreachable copy for a request error", () => {
		// GIVEN / WHEN
		const text = renderStatus({ kind: "request-error" });

		// THEN
		expect(text).toBe(
			"Preview unavailable: the scanner service isn't reachable. Try again.",
		);
	});
});

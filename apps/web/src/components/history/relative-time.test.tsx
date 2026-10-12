import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RelativeTime } from "./relative-time";

const NOW = new Date("2026-10-09T12:00:00.000Z");
const STARTED_AT = "2026-10-09T11:55:00.000Z";
const SCREEN_READER_ONLY = ".sr-only";

describe("RelativeTime", () => {
	it("shows the exact start time to everyone, not only to screen readers", () => {
		// WHEN
		render(<RelativeTime iso={STARTED_AT} now={NOW} />);

		// THEN
		expect(
			screen.getByText(/Oct 9, 2026, 11:55 AM UTC/).closest(SCREEN_READER_ONLY),
		).toBeNull();
	});
});

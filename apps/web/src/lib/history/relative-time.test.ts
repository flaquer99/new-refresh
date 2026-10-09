import { describe, expect, it } from "vitest";
import { formatExactTime, formatRelativeTime } from "./relative-time";

const NOW = new Date("2026-10-09T12:00:00.000Z");

describe("formatRelativeTime", () => {
	it.each([
		["2026-10-09T11:59:30.000Z", "just now"],
		["2026-10-09T11:55:00.000Z", "5 minutes ago"],
		["2026-10-09T09:00:00.000Z", "3 hours ago"],
		["2026-10-08T12:00:00.000Z", "yesterday"],
		["2026-09-01T12:00:00.000Z", "last month"],
	])("describes %s as %s", (iso, expected) => {
		// WHEN
		const relative = formatRelativeTime(iso, NOW);

		// THEN
		expect(relative).toBe(expected);
	});
});

describe("formatExactTime", () => {
	it("formats the exact start time in UTC", () => {
		// WHEN
		const exact = formatExactTime("2026-10-09T11:55:00.000Z");

		// THEN
		expect(exact).toBe("Oct 9, 2026, 11:55 AM UTC");
	});
});

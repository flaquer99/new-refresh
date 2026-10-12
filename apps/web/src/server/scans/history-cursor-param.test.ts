import { encodeCursor } from "@refresh/db/history-cursor";
import { describe, expect, it } from "vitest";
import { readHistoryCursor } from "./history-cursor-param";

const VALID_CURSOR = encodeCursor({
	startedAt: new Date("2026-10-12T11:53:00.000Z"),
	id: "4707ec06-bcd2-42aa-9538-ca9c40400236",
});

describe("readHistoryCursor", () => {
	it("returns a well-formed cursor from the before parameter", () => {
		// GIVEN
		const params = { before: VALID_CURSOR };

		// WHEN
		const cursor = readHistoryCursor(params);

		// THEN
		expect(cursor).toBe(VALID_CURSOR);
	});

	it("returns null when the before parameter is missing", () => {
		// GIVEN
		const params = {};

		// WHEN
		const cursor = readHistoryCursor(params);

		// THEN
		expect(cursor).toBeNull();
	});

	it("returns null for a malformed cursor so the page is treated as the newest scans", () => {
		// GIVEN
		const params = { before: "garbage" };

		// WHEN
		const cursor = readHistoryCursor(params);

		// THEN
		expect(cursor).toBeNull();
	});

	it("uses the first value when the parameter is repeated", () => {
		// GIVEN
		const params = { before: [VALID_CURSOR, "garbage"] };

		// WHEN
		const cursor = readHistoryCursor(params);

		// THEN
		expect(cursor).toBe(VALID_CURSOR);
	});
});

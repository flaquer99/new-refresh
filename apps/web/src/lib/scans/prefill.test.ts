import { describe, expect, it } from "vitest";
import { readPrefill, runAgainHref } from "./prefill";

const URL = "https://www.example.org/a?b=c";

describe("readPrefill", () => {
	it("reads the url and depth of a scan to run again", () => {
		// WHEN
		const prefill = readPrefill({ url: URL, depth: "2" });

		// THEN
		expect(prefill).toEqual({ url: URL, depth: 2 });
	});

	it.each([
		[{}],
		[{ url: "ftp://www.example.org/" }],
		[{ url: "not a url", depth: "1" }],
	])("ignores %j because the url is missing or invalid", (params) => {
		// WHEN
		const prefill = readPrefill(params);

		// THEN
		expect(prefill).toBeNull();
	});

	it.each(["9", "-1", "deep", undefined])(
		"falls back to depth 0 for the depth %j",
		(depth) => {
			// WHEN
			const prefill = readPrefill({ url: URL, depth });

			// THEN
			expect(prefill?.depth).toBe(0);
		},
	);

	it("uses the first value of a repeated parameter", () => {
		// WHEN
		const prefill = readPrefill({
			url: [URL, "https://other.test/"],
			depth: ["1"],
		});

		// THEN
		expect(prefill).toEqual({ url: URL, depth: 1 });
	});
});

describe("runAgainHref", () => {
	it("encodes the url and depth into the form's query", () => {
		// WHEN
		const href = runAgainHref({ url: URL, depth: 1 });

		// THEN
		expect(href).toBe(
			"/?url=https%3A%2F%2Fwww.example.org%2Fa%3Fb%3Dc&depth=1",
		);
	});

	it("round-trips through readPrefill", () => {
		// GIVEN
		const params = Object.fromEntries(
			new URLSearchParams(runAgainHref({ url: URL, depth: 3 }).slice(2)),
		);

		// WHEN
		const prefill = readPrefill(params);

		// THEN
		expect(prefill).toEqual({ url: URL, depth: 3 });
	});
});

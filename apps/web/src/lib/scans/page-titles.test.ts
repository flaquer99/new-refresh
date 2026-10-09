import { describe, expect, it } from "vitest";
import { historyTitle, scanTitle } from "./page-titles";

describe("page titles", () => {
	it("names a scan link after the scanned host", () => {
		// WHEN
		const title = scanTitle("https://www.example.org:8443/a/b");

		// THEN
		expect(title).toBe("Scan of www.example.org:8443");
	});

	it("titles a missing scan as not found", () => {
		// WHEN
		const title = scanTitle(null);

		// THEN
		expect(title).toBe("Scan not found");
	});

	it("titles the first history page", () => {
		// WHEN
		const title = historyTitle(null);

		// THEN
		expect(title).toBe("Scan history");
	});

	it("titles an older history page", () => {
		// WHEN
		const title = historyTitle("cursor");

		// THEN
		expect(title).toBe("Scan history — older scans");
	});
});

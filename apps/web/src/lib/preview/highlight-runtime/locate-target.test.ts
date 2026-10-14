import { beforeEach, describe, expect, it } from "vitest";
import { locateTarget } from "./locate-target";

describe("locateTarget", () => {
	beforeEach(() => {
		document.body.innerHTML = `<p class="x">a</p><p class="x">b</p>`;
	});

	it("returns found with the match count for a matching selector", () => {
		const result = locateTarget(document, "p.x");

		expect(result.outcome).toBe("found");
		expect(result.matchCount).toBe(2);
		expect(result.element?.textContent).toBe("a");
	});

	it("returns not-found when nothing matches", () => {
		const result = locateTarget(document, "section");

		expect(result).toEqual({
			outcome: "not-found",
			element: null,
			matchCount: 0,
		});
	});

	it("returns unsupported-selector for the shadow DOM separator", () => {
		const result = locateTarget(document, "iframe >>> p");

		expect(result.outcome).toBe("unsupported-selector");
	});

	it("returns unsupported-selector for a selector that throws", () => {
		const result = locateTarget(document, "p[");

		expect(result.outcome).toBe("unsupported-selector");
		expect(result.matchCount).toBe(0);
	});
});

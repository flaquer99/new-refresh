import { afterEach, describe, expect, it, vi } from "vitest";
import { EMPTY_BOX, VISIBLE_BOX } from "@/testing/highlight-helpers";
import { isRendered } from "./is-rendered";

function createElement(style = ""): HTMLElement {
	document.body.innerHTML = `<div id="t" style="${style}">x</div>`;
	return document.getElementById("t") as HTMLElement;
}

describe("isRendered", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("is true for a visible element with a box", () => {
		const element = createElement();
		vi.spyOn(element, "getBoundingClientRect").mockReturnValue(VISIBLE_BOX);

		expect(isRendered(window, element)).toBe(true);
	});

	it("is false for a zero-size element", () => {
		const element = createElement();
		vi.spyOn(element, "getBoundingClientRect").mockReturnValue(EMPTY_BOX);

		expect(isRendered(window, element)).toBe(false);
	});

	it("is false for display none", () => {
		const element = createElement("display:none");
		vi.spyOn(element, "getBoundingClientRect").mockReturnValue(VISIBLE_BOX);

		expect(isRendered(window, element)).toBe(false);
	});

	it("is false for visibility hidden", () => {
		const element = createElement("visibility:hidden");
		vi.spyOn(element, "getBoundingClientRect").mockReturnValue(VISIBLE_BOX);

		expect(isRendered(window, element)).toBe(false);
	});
});

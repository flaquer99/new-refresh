// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EMPTY_BOX, VISIBLE_BOX } from "@/testing/highlight-helpers";
import { buildHighlightScript } from "./build-highlight-script";

const LINE_SEPARATOR = "\u2028";

function config(selector: string) {
	return { selector, token: "tok", negativeVerdictMs: 2500 };
}

describe("buildHighlightScript", () => {
	let postMessage: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		document.body.innerHTML = `<div id="t">x</div>`;
		postMessage = vi.fn();
		vi.spyOn(window, "parent", "get").mockReturnValue({
			postMessage,
		} as unknown as Window);
		Element.prototype.scrollIntoView = vi.fn();
	});

	afterEach(() => {
		document.querySelector("[data-refresh-highlight]")?.remove();
	});

	it("escapes a selector containing a script terminator and U+2028", () => {
		const script = buildHighlightScript(
			config(`a</script><b>&${LINE_SEPARATOR}x`),
		);

		expect(script).not.toContain("</script>");
		expect(script).not.toContain(LINE_SEPARATOR);
		expect(script).toContain("\\u003c/script\\u003e");
		expect(script).toContain("\\u2028");
	});

	it("evaluates in jsdom with no closure references and posts a message", () => {
		vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(
			VISIBLE_BOX,
		);
		const script = buildHighlightScript(config("#t"));

		new Function(script)();

		expect(postMessage).toHaveBeenCalledWith(
			{
				source: "refresh-preview",
				token: "tok",
				outcome: "highlighted",
				matchCount: 1,
			},
			"*",
		);
	});

	it("round-trips an escaped selector to the runtime unchanged", () => {
		vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(
			EMPTY_BOX,
		);
		document.body.innerHTML = `<div data-x="a<b&c"></div>`;
		const script = buildHighlightScript(config(`[data-x="a<b&c"]`));
		vi.useFakeTimers();

		new Function(script)();
		vi.advanceTimersByTime(2500);
		vi.useRealTimers();

		expect(postMessage.mock.calls[0]?.[0]).toMatchObject({
			outcome: "hidden",
			matchCount: 1,
		});
	});
});

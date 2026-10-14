import { PREVIEW_NEGATIVE_VERDICT_MS } from "@refresh/scan-contracts/preview";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	EMPTY_BOX,
	highlightHelpers,
	VISIBLE_BOX,
} from "@/testing/highlight-helpers";
import { startPreviewHighlight } from "./start-preview-highlight";

const TOKEN = "tok";
const CONFIG = {
	selector: "#t",
	token: TOKEN,
	negativeVerdictMs: PREVIEW_NEGATIVE_VERDICT_MS,
};

let postMessage: ReturnType<typeof vi.fn>;
let scrollIntoView: ReturnType<typeof vi.fn>;

function stubLayout(box: DOMRect) {
	vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(box);
}

function run() {
	startPreviewHighlight(window, CONFIG, highlightHelpers);
}

function messageOf(index: number) {
	return postMessage.mock.calls[index]?.[0];
}

describe("startPreviewHighlight", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		document.body.innerHTML = "";
		postMessage = vi.fn();
		scrollIntoView = vi.fn();
		vi.spyOn(window, "parent", "get").mockReturnValue({
			postMessage,
		} as unknown as Window);
		Element.prototype.scrollIntoView =
			scrollIntoView as unknown as Element["scrollIntoView"];
	});

	afterEach(() => {
		vi.useRealTimers();
		document.querySelector("[data-refresh-highlight]")?.remove();
	});

	it("posts highlighted once and scrolls the target into view", () => {
		document.body.innerHTML = `<div id="t">x</div>`;
		stubLayout(VISIBLE_BOX);

		run();
		vi.advanceTimersByTime(PREVIEW_NEGATIVE_VERDICT_MS * 2);

		expect(postMessage).toHaveBeenCalledTimes(1);
		expect(messageOf(0)).toEqual({
			source: "refresh-preview",
			token: TOKEN,
			outcome: "highlighted",
			matchCount: 1,
		});
		expect(scrollIntoView).toHaveBeenCalledWith({
			block: "center",
			behavior: "instant",
		});
	});

	it("posts highlighted when the target is injected late", async () => {
		stubLayout(VISIBLE_BOX);
		run();

		document.body.innerHTML = `<div id="t">x</div>`;
		await vi.advanceTimersByTimeAsync(PREVIEW_NEGATIVE_VERDICT_MS - 1);

		expect(postMessage).toHaveBeenCalledTimes(1);
		expect(messageOf(0).outcome).toBe("highlighted");
	});

	it("posts not-found after the deadline when nothing matches", () => {
		run();
		vi.advanceTimersByTime(PREVIEW_NEGATIVE_VERDICT_MS - 1);
		expect(postMessage).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);

		expect(postMessage).toHaveBeenCalledTimes(1);
		expect(messageOf(0)).toMatchObject({ outcome: "not-found", matchCount: 0 });
	});

	it("posts hidden when matched but never rendered", () => {
		document.body.innerHTML = `<div id="t">x</div>`;
		stubLayout(EMPTY_BOX);

		run();
		vi.advanceTimersByTime(PREVIEW_NEGATIVE_VERDICT_MS);

		expect(postMessage).toHaveBeenCalledTimes(1);
		expect(messageOf(0)).toMatchObject({ outcome: "hidden", matchCount: 1 });
	});

	it("posts unsupported-selector immediately for a shadow selector", () => {
		startPreviewHighlight(
			window,
			{ ...CONFIG, selector: "a >>> b" },
			highlightHelpers,
		);

		expect(postMessage).toHaveBeenCalledTimes(1);
		expect(messageOf(0)).toMatchObject({ outcome: "unsupported-selector" });
	});

	it("does not change a verdict already sent when the target appears later", async () => {
		stubLayout(VISIBLE_BOX);
		run();
		await vi.advanceTimersByTimeAsync(PREVIEW_NEGATIVE_VERDICT_MS);

		document.body.innerHTML = `<div id="t">x</div>`;
		await vi.advanceTimersByTimeAsync(PREVIEW_NEGATIVE_VERDICT_MS);

		expect(postMessage).toHaveBeenCalledTimes(1);
		expect(messageOf(0).outcome).toBe("not-found");
	});
});

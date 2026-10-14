import { afterEach, describe, expect, it, vi } from "vitest";
import { VISIBLE_BOX } from "@/testing/highlight-helpers";
import { drawOverlay } from "./draw-overlay";

function createTarget(): HTMLElement {
	document.body.innerHTML = `<h1 id="t" class="a" style="color:red">x</h1>`;
	const target = document.getElementById("t") as HTMLElement;
	vi.spyOn(target, "getBoundingClientRect").mockReturnValue(VISIBLE_BOX);
	return target;
}

describe("drawOverlay", () => {
	afterEach(() => {
		document.querySelector("[data-refresh-highlight]")?.remove();
	});

	it("leaves the target's inline style and classes unchanged", () => {
		const target = createTarget();

		drawOverlay(document, target);

		expect(target.getAttribute("style")).toBe("color:red");
		expect(target.className).toBe("a");
	});

	it("draws a non-interactive double ring over the target box", () => {
		const target = createTarget();

		drawOverlay(document, target);
		const overlay = document.querySelector<HTMLElement>(
			"[data-refresh-highlight]",
		);

		expect(overlay?.style.pointerEvents).toBe("none");
		expect(overlay?.style.outline).toContain("2px solid");
		expect(overlay?.style.boxShadow).toContain("3px");
		expect(overlay?.style.width).toBe("100px");
		expect(overlay?.style.top).toBe("10px");
	});

	it("repositions the overlay when the window resizes", () => {
		const target = createTarget();
		drawOverlay(document, target);
		vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
			...VISIBLE_BOX,
			top: 50,
		});

		window.dispatchEvent(new Event("resize"));
		const overlay = document.querySelector<HTMLElement>(
			"[data-refresh-highlight]",
		);

		expect(overlay?.style.top).toBe("50px");
	});
});

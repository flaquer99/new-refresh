import { describe, expect, it } from "vitest";
import { lockInteraction } from "./lock-interaction";

describe("lockInteraction", () => {
	it("prevents default on link clicks", () => {
		document.body.innerHTML = `<a id="l" href="/x">go</a>`;
		lockInteraction(document);
		const click = new MouseEvent("click", { bubbles: true, cancelable: true });

		document.getElementById("l")?.dispatchEvent(click);

		expect(click.defaultPrevented).toBe(true);
	});

	it("prevents default on form submits", () => {
		document.body.innerHTML = `<form id="f"><button>ok</button></form>`;
		lockInteraction(document);
		const submit = new Event("submit", { bubbles: true, cancelable: true });

		document.getElementById("f")?.dispatchEvent(submit);

		expect(submit.defaultPrevented).toBe(true);
	});

	it("removes focusable elements from the tab order", () => {
		document.body.innerHTML = `<a href="/x">a</a><input><div tabindex="0"></div>`;

		lockInteraction(document);

		const tabindexes = [...document.body.children].map((child) =>
			child.getAttribute("tabindex"),
		);
		expect(tabindexes).toEqual(["-1", "-1", "-1"]);
	});
});

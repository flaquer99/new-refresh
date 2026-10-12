import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CodeBlock } from "./code-block";

describe("CodeBlock", () => {
	it("is a named, keyboard focusable figure with the code", () => {
		// GIVEN
		const code = `<div>${"x".repeat(500)}</div>`;

		// WHEN
		render(<CodeBlock code={code} label="HTML snippet" />);

		// THEN
		const block = screen.getByRole("figure", { name: "HTML snippet" });
		expect(block.getAttribute("tabindex")).toBe("0");
		expect(block.textContent).toBe(code);
		expect(block.className).toContain("overflow-x-auto");
	});

	it("does not add a landmark for every snippet", () => {
		// GIVEN / WHEN
		render(<CodeBlock code="<img src='a.png'>" label="HTML snippet" />);

		// THEN
		expect(screen.queryAllByRole("region")).toHaveLength(0);
	});
});

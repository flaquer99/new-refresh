import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HudStat } from "./hud-stat";

describe("HudStat", () => {
	it("keeps the definition as the next sibling of the term", () => {
		// WHEN
		const { container } = render(
			<dl>
				<HudStat term="Violations" value={4} />
			</dl>,
		);

		// THEN
		const definition = container.querySelector("dt")?.nextElementSibling;
		expect(definition?.tagName).toBe("DD");
		expect(definition?.textContent).toBe("4");
	});
});

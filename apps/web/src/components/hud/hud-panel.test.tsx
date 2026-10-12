import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HudPanel } from "./hud-panel";
import { MonoValue } from "./mono-value";

describe("HudPanel", () => {
	it("renders its title and children inside a labelled region", () => {
		// WHEN
		render(
			<>
				<h2 id="h">Summary</h2>
				<HudPanel labelledBy="h" title="Console">
					Body
				</HudPanel>
			</>,
		);

		// THEN
		const region = screen.getByRole("region", { name: "Summary" });
		expect(region.textContent).toBe("ConsoleBody");
	});
});

describe("MonoValue", () => {
	it("wraps anywhere", () => {
		// WHEN
		render(<MonoValue>https://example.com/a/very/long/path</MonoValue>);

		// THEN
		const value = screen.getByText("https://example.com/a/very/long/path");
		expect(value.className).toContain("break-all");
	});
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ViewportSwitch } from "./viewport-switch";

const renderSwitch = (viewport: "desktop" | "mobile") => {
	render(
		<ViewportSwitch
			onSelect={() => undefined}
			options={["desktop", "mobile"]}
			viewport={viewport}
		/>,
	);
	return {
		desktop: screen.getByRole("button", { name: /desktop/i }),
		mobile: screen.getByRole("button", { name: /mobile/i }),
	};
};

describe("ViewportSwitch", () => {
	it("marks the active viewport as pressed", () => {
		// GIVEN / WHEN
		const buttons = renderSwitch("mobile");

		// THEN
		expect(buttons.mobile.getAttribute("aria-pressed")).toBe("true");
		expect(buttons.desktop.getAttribute("aria-pressed")).toBe("false");
	});

	it("styles the active viewport with the primary fill, not the muted outline fill", () => {
		// GIVEN / WHEN
		const buttons = renderSwitch("desktop");

		// THEN
		expect(buttons.desktop.className).toContain("bg-primary");
		expect(buttons.mobile.className).not.toContain("bg-primary");
	});
});

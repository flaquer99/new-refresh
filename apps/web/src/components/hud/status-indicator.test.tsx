import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusIndicator } from "./status-indicator";

const PULSE_SELECTOR = ".motion-safe\\:animate-ping";

describe("StatusIndicator", () => {
	it("shows the text label", () => {
		// WHEN
		render(<StatusIndicator label="Scanning" />);

		// THEN
		expect(screen.getByText("Scanning").textContent).toBe("Scanning");
	});

	it("pulses only under motion-safe when active", () => {
		// WHEN
		const { container } = render(<StatusIndicator active label="Scanning" />);

		// THEN
		expect(container.querySelector(PULSE_SELECTOR)).not.toBeNull();
	});

	it("renders no pulse when inactive", () => {
		// WHEN
		const { container } = render(<StatusIndicator label="Idle" />);

		// THEN
		expect(container.querySelector(PULSE_SELECTOR)).toBeNull();
	});
});

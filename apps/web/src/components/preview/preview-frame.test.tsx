import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { START_URL } from "@/testing/finding-fixtures";
import { PreviewFrame } from "./preview-frame";

const renderFrame = (viewport: "desktop" | "mobile" = "desktop") => {
	render(
		<PreviewFrame
			document="<p>hi</p>"
			pageUrl={START_URL}
			ref={null}
			viewport={viewport}
		/>,
	);
	return screen.getByTitle(`Live preview of ${START_URL}`);
};

describe("PreviewFrame", () => {
	it("renders a sandboxed, no-referrer, unfocusable, titled iframe", () => {
		// GIVEN / WHEN
		const frame = renderFrame();

		// THEN
		expect(frame.getAttribute("sandbox")).toBe("allow-scripts");
		expect(frame.getAttribute("referrerpolicy")).toBe("no-referrer");
		expect(frame.getAttribute("tabindex")).toBe("-1");
		expect(frame.hasAttribute("data-preview-frame")).toBe(true);
		expect(frame.getAttribute("srcdoc")).toBe("<p>hi</p>");
	});

	it("sizes the frame to the desktop viewport", () => {
		// GIVEN / WHEN
		const frame = renderFrame("desktop");

		// THEN
		expect(frame.style.width).toBe("1280px");
		expect(frame.style.height).toBe("800px");
	});

	it("sizes the frame to the mobile viewport", () => {
		// GIVEN / WHEN
		const frame = renderFrame("mobile");

		// THEN
		expect(frame.style.width).toBe("320px");
		expect(frame.style.height).toBe("640px");
	});

	it("scales the frame down to the container width", () => {
		// GIVEN
		vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
			width: 640,
		} as DOMRect);

		// WHEN
		const frame = renderFrame("desktop");

		// THEN
		expect(frame.style.transform).toBe("scale(0.5)");
	});
});

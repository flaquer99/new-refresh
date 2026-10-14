import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useElementWidth } from "./use-element-width";

type ObserverCallback = (entries: { contentRect: { width: number } }[]) => void;

function Probe() {
	const { ref, width } = useElementWidth<HTMLDivElement>();
	return (
		<div data-testid="probe" ref={ref}>
			{width}
		</div>
	);
}

describe("useElementWidth", () => {
	it("tracks the width reported by the resize observer", () => {
		// GIVEN
		let notify: ObserverCallback = () => undefined;
		const disconnect = vi.fn();
		vi.stubGlobal(
			"ResizeObserver",
			class {
				constructor(callback: ObserverCallback) {
					notify = callback;
				}
				observe = () => undefined;
				disconnect = disconnect;
			},
		);
		const { unmount } = render(<Probe />);

		// WHEN
		act(() => {
			notify([{ contentRect: { width: 480 } }]);
		});

		// THEN
		expect(screen.getByTestId("probe").textContent).toBe("480");
		unmount();
		expect(disconnect).toHaveBeenCalledTimes(1);
	});
});

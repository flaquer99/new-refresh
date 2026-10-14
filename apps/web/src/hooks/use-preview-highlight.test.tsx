import { PREVIEW_HIGHLIGHT_WAIT_MS } from "@refresh/scan-contracts/preview";
import { act, render, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { advanceTime, installFakeTimersPerTest } from "@/testing/polling";
import { dispatchHighlight } from "@/testing/preview-fixtures";
import { usePreviewHighlight } from "./use-preview-highlight";

installFakeTimersPerTest();

const mountFrame = () => {
	const { container } = render(<iframe title="frame" />);
	const frame = container.querySelector("iframe") as HTMLIFrameElement;
	return { current: frame };
};

const renderHighlight = (token: string | null = "token-1") => {
	const frame = mountFrame();
	const hook = renderHook(() => usePreviewHighlight({ frame, token }));
	return { frame, ...hook };
};

describe("usePreviewHighlight", () => {
	it("reports the outcome sent by the frame", () => {
		// GIVEN
		const { frame, result } = renderHighlight();

		// WHEN
		act(() => {
			dispatchHighlight({
				source: frame.current.contentWindow,
				message: { matchCount: 3 },
			});
		});

		// THEN
		expect(result.current).toEqual({ outcome: "highlighted", matchCount: 3 });
	});

	it("ignores messages from another source", () => {
		// GIVEN
		const { result } = renderHighlight();

		// WHEN
		act(() => {
			dispatchHighlight({ source: window });
		});

		// THEN
		expect(result.current.outcome).toBe("loading");
	});

	it("ignores messages with a wrong token", () => {
		// GIVEN
		const { frame, result } = renderHighlight();

		// WHEN
		act(() => {
			dispatchHighlight({
				source: frame.current.contentWindow,
				message: { token: "other" },
			});
		});

		// THEN
		expect(result.current.outcome).toBe("loading");
	});

	it("ignores payloads that fail the schema", () => {
		// GIVEN
		const { frame, result } = renderHighlight();

		// WHEN
		act(() => {
			window.dispatchEvent(
				new MessageEvent("message", {
					data: { nope: true },
					source: frame.current.contentWindow,
				}),
			);
		});

		// THEN
		expect(result.current.outcome).toBe("loading");
	});

	it("accepts only the first valid message", () => {
		// GIVEN
		const { frame, result } = renderHighlight();
		const source = frame.current.contentWindow;

		// WHEN
		act(() => {
			dispatchHighlight({ source, message: { outcome: "hidden" } });
			dispatchHighlight({ source, message: { outcome: "not-found" } });
		});

		// THEN
		expect(result.current.outcome).toBe("hidden");
	});

	it("falls back to no-response after the wait", async () => {
		// GIVEN
		const { result } = renderHighlight();

		// WHEN
		await advanceTime(PREVIEW_HIGHLIGHT_WAIT_MS);

		// THEN
		expect(result.current.outcome).toBe("no-response");
	});

	it("does not fall back once the frame has answered", async () => {
		// GIVEN
		const { frame, result } = renderHighlight();
		act(() => {
			dispatchHighlight({ source: frame.current.contentWindow });
		});

		// WHEN
		await advanceTime(PREVIEW_HIGHLIGHT_WAIT_MS);

		// THEN
		expect(result.current.outcome).toBe("highlighted");
	});

	it("waits for a token before listening", async () => {
		// GIVEN
		const { result } = renderHighlight(null);

		// WHEN
		await advanceTime(PREVIEW_HIGHLIGHT_WAIT_MS);

		// THEN
		expect(result.current.outcome).toBe("loading");
	});
});

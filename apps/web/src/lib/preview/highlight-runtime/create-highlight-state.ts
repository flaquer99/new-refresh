import type { FrameWindow, HighlightState } from "./highlight-types";

export function createHighlightState(win: FrameWindow): HighlightState {
	const state: HighlightState = {
		done: false,
		lastOutcome: "not-found",
		lastMatchCount: 0,
		observer: null,
		timer: null,
		stop: () => {
			state.done = true;
			state.observer?.disconnect();
			if (state.timer !== null) {
				win.clearTimeout(state.timer);
			}
		},
	};
	return state;
}

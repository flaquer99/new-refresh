import type { FrameWindow, HighlightConfig, Poster } from "./highlight-types";

export function createPoster(
	win: FrameWindow,
	config: HighlightConfig,
): Poster {
	let sent = false;
	return (outcome, matchCount) => {
		if (sent) {
			return;
		}
		sent = true;
		win.parent.postMessage(
			{ source: "refresh-preview", token: config.token, outcome, matchCount },
			"*",
		);
	};
}

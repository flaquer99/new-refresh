import type {
	FrameWindow,
	HighlightConfig,
	HighlightHelpers,
} from "./highlight-types";

export function startPreviewHighlight(
	win: FrameWindow,
	config: HighlightConfig,
	helpers: HighlightHelpers,
): void {
	const post = helpers.createPoster(win, config);
	const state = helpers.createHighlightState(win);
	const begin = () =>
		helpers.beginHighlight({ win, config, helpers, state, post });
	if (win.document.readyState === "loading") {
		win.document.addEventListener("DOMContentLoaded", begin);
		return;
	}
	begin();
}

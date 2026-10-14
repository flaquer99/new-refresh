import type { AttemptContext } from "./highlight-types";

export function attemptHighlight(context: AttemptContext): void {
	const { win, config, helpers, state, post } = context;
	if (state.done) {
		return;
	}
	const target = helpers.locateTarget(win.document, config.selector);
	if (target.outcome === "unsupported-selector") {
		state.stop();
		post("unsupported-selector", 0);
		return;
	}
	if (target.element && helpers.isRendered(win, target.element)) {
		state.stop();
		target.element.scrollIntoView({ block: "center", behavior: "instant" });
		helpers.drawOverlay(win.document, target.element);
		post("highlighted", target.matchCount);
		return;
	}
	state.lastOutcome = target.element ? "hidden" : "not-found";
	state.lastMatchCount = target.matchCount;
}

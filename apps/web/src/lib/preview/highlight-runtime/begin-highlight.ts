import type { AttemptContext } from "./highlight-types";

export function beginHighlight(context: AttemptContext): void {
	const { win, config, helpers, state, post } = context;
	helpers.lockInteraction(win.document);
	helpers.attemptHighlight(context);
	if (state.done) {
		return;
	}
	const observer = new win.MutationObserver(() =>
		helpers.attemptHighlight(context),
	);
	state.observer = observer;
	observer.observe(win.document, {
		childList: true,
		subtree: true,
		attributes: true,
	});
	state.timer = win.setTimeout(() => {
		state.stop();
		post(state.lastOutcome, state.lastMatchCount);
	}, config.negativeVerdictMs);
}

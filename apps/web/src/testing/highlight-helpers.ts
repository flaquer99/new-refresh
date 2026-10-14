import { attemptHighlight } from "@/lib/preview/highlight-runtime/attempt-highlight";
import { beginHighlight } from "@/lib/preview/highlight-runtime/begin-highlight";
import { createHighlightState } from "@/lib/preview/highlight-runtime/create-highlight-state";
import { createPoster } from "@/lib/preview/highlight-runtime/create-poster";
import { drawOverlay } from "@/lib/preview/highlight-runtime/draw-overlay";
import type { HighlightHelpers } from "@/lib/preview/highlight-runtime/highlight-types";
import { isRendered } from "@/lib/preview/highlight-runtime/is-rendered";
import { locateTarget } from "@/lib/preview/highlight-runtime/locate-target";
import { lockInteraction } from "@/lib/preview/highlight-runtime/lock-interaction";

export const highlightHelpers: HighlightHelpers = {
	locateTarget,
	isRendered,
	drawOverlay,
	lockInteraction,
	createPoster,
	createHighlightState,
	attemptHighlight,
	beginHighlight,
};

export const VISIBLE_BOX = {
	width: 100,
	height: 20,
	top: 10,
	left: 5,
	right: 105,
	bottom: 30,
	x: 5,
	y: 10,
	toJSON: () => ({}),
} as DOMRect;

export const EMPTY_BOX = { ...VISIBLE_BOX, width: 0, height: 0 } as DOMRect;

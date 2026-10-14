import "server-only";
import { attemptHighlight } from "@/lib/preview/highlight-runtime/attempt-highlight";
import { beginHighlight } from "@/lib/preview/highlight-runtime/begin-highlight";
import { createHighlightState } from "@/lib/preview/highlight-runtime/create-highlight-state";
import { createPoster } from "@/lib/preview/highlight-runtime/create-poster";
import { drawOverlay } from "@/lib/preview/highlight-runtime/draw-overlay";
import type { HighlightConfig } from "@/lib/preview/highlight-runtime/highlight-types";
import { isRendered } from "@/lib/preview/highlight-runtime/is-rendered";
import { locateTarget } from "@/lib/preview/highlight-runtime/locate-target";
import { lockInteraction } from "@/lib/preview/highlight-runtime/lock-interaction";
import { startPreviewHighlight } from "@/lib/preview/highlight-runtime/start-preview-highlight";

const HELPERS = {
	locateTarget,
	isRendered,
	drawOverlay,
	lockInteraction,
	createPoster,
	createHighlightState,
	attemptHighlight,
	beginHighlight,
};

const UNSAFE_CHARACTERS = /[<>&\u2028\u2029]/g;

function escapeCharacter(character: string): string {
	return `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`;
}

function serializeHelpers(): string {
	const entries = Object.entries(HELPERS).map(
		([name, helper]) => `${name}: ${helper}`,
	);
	return `{ ${entries.join(", ")} }`;
}

export function buildHighlightScript(config: HighlightConfig): string {
	const safeConfig = JSON.stringify(config).replace(
		UNSAFE_CHARACTERS,
		escapeCharacter,
	);
	return `(${startPreviewHighlight})(window, ${safeConfig}, ${serializeHelpers()});`;
}

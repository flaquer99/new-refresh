import type { HighlightOutcome } from "@refresh/scan-contracts/preview-ui";

export type FrameWindow = Window & typeof globalThis;

export type HighlightConfig = {
	selector: string;
	token: string;
	negativeVerdictMs: number;
};

export type LocateResult = {
	outcome: "found" | "not-found" | "unsupported-selector";
	element: Element | null;
	matchCount: number;
};

export type HighlightState = {
	done: boolean;
	lastOutcome: HighlightOutcome;
	lastMatchCount: number;
	observer: MutationObserver | null;
	timer: number | null;
	stop: () => void;
};

export type Poster = (outcome: HighlightOutcome, matchCount: number) => void;

export type HighlightHelpers = {
	locateTarget: (doc: Document, selector: string) => LocateResult;
	isRendered: (win: FrameWindow, element: Element) => boolean;
	drawOverlay: (doc: Document, element: Element) => () => void;
	lockInteraction: (doc: Document) => void;
	createPoster: (win: FrameWindow, config: HighlightConfig) => Poster;
	createHighlightState: (win: FrameWindow) => HighlightState;
	attemptHighlight: (context: AttemptContext) => void;
	beginHighlight: (context: AttemptContext) => void;
};

export type AttemptContext = {
	win: FrameWindow;
	config: HighlightConfig;
	helpers: HighlightHelpers;
	state: HighlightState;
	post: Poster;
};

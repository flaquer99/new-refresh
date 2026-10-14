import type { PreviewUnavailableReason } from "@refresh/scan-contracts/preview";
import type { HighlightOutcome } from "@refresh/scan-contracts/preview-ui";

export type HighlightState = {
	outcome: HighlightOutcome | "loading" | "no-response";
	matchCount: number;
};

export type PreviewStatusValue =
	| { kind: "highlight"; state: HighlightState }
	| {
			kind: "unavailable";
			reason: PreviewUnavailableReason;
			httpStatus: number | null;
	  }
	| { kind: "request-error" };

export const LOADING_HIGHLIGHT: HighlightState = {
	outcome: "loading",
	matchCount: 0,
};

const HIGHLIGHT_COPY: Record<HighlightState["outcome"], string> = {
	loading: "Loading live page…",
	highlighted: "Element highlighted.",
	"not-found":
		"The element was not found. The page may have changed since this scan.",
	hidden: "The element is on the page but not visible on screen.",
	"unsupported-selector":
		"Highlighting inside embedded content (frames or shadow DOM) isn't supported.",
	"no-response": "The page loaded, but the element couldn't be highlighted.",
};

const UNAVAILABLE_COPY: Record<
	Exclude<PreviewUnavailableReason, "http-error">,
	string
> = {
	"not-html": "Preview unavailable: the page is not an HTML document.",
	"too-large": "Preview unavailable: the page is larger than 5 MB.",
	timeout: "Preview unavailable: the page took too long to respond.",
	"network-error": "Preview unavailable: the page couldn't be reached.",
	"blocked-address": "Preview unavailable: the page's address isn't allowed.",
};

export const REQUEST_ERROR_COPY =
	"Preview unavailable: the scanner service isn't reachable. Try again.";

const highlightMessage = ({ outcome, matchCount }: HighlightState): string => {
	if (outcome === "highlighted" && matchCount > 1) {
		return `${HIGHLIGHT_COPY.highlighted} This selector matches ${matchCount} elements; the first is highlighted.`;
	}
	return HIGHLIGHT_COPY[outcome];
};

export const statusMessage = (status: PreviewStatusValue): string => {
	if (status.kind === "highlight") {
		return highlightMessage(status.state);
	}
	if (status.kind === "request-error") {
		return REQUEST_ERROR_COPY;
	}
	if (status.reason === "http-error") {
		return `Preview unavailable: the page returned HTTP ${status.httpStatus}.`;
	}
	return UNAVAILABLE_COPY[status.reason];
};

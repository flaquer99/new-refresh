import {
	type FindingPreview,
	PREVIEW_MESSAGE_SOURCE,
	type PreviewHighlightMessage,
} from "@refresh/scan-contracts/preview-ui";
import { START_URL } from "./finding-fixtures";

export const PREVIEW_TOKEN = "token-1";
export const PREVIEW_SCAN_ID = "scan-1";

export const loadedPreview = (
	overrides: Partial<Extract<FindingPreview, { kind: "loaded" }>> = {},
): FindingPreview => ({
	kind: "loaded",
	pageUrl: START_URL,
	finalUrl: START_URL,
	document: "<!doctype html><p>hello</p>",
	token: PREVIEW_TOKEN,
	...overrides,
});

export const unavailablePreview = (
	overrides: Partial<Extract<FindingPreview, { kind: "unavailable" }>> = {},
): FindingPreview => ({
	kind: "unavailable",
	pageUrl: START_URL,
	reason: "not-html",
	httpStatus: null,
	...overrides,
});

export const jsonResponse = (body: unknown, status = 200): Response =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});

type HighlightDispatch = {
	source: MessageEventSource | null;
	message?: Partial<PreviewHighlightMessage>;
};

export const dispatchHighlight = ({ source, message }: HighlightDispatch) => {
	const data: PreviewHighlightMessage = {
		source: PREVIEW_MESSAGE_SOURCE,
		token: PREVIEW_TOKEN,
		outcome: "highlighted",
		matchCount: 1,
		...message,
	};
	window.dispatchEvent(new MessageEvent("message", { data, source }));
};

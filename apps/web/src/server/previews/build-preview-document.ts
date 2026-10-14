import "server-only";
import { PREVIEW_NEGATIVE_VERDICT_MS } from "@refresh/scan-contracts/preview";
import { parse, serialize } from "parse5";
import { buildHighlightScript } from "./build-highlight-script";
import {
	buildHeadNodes,
	findHead,
	prependChildren,
	removeNavigationHints,
} from "./preview-head-nodes";

export type PreviewDocumentParams = {
	finalUrl: string;
	selector: string;
	token: string;
};

export const buildPreviewDocument = (
	html: string,
	{ finalUrl, selector, token }: PreviewDocumentParams,
): string => {
	const document = parse(html);
	removeNavigationHints(document);
	const head = findHead(document);
	if (!head) {
		throw new Error("The parsed preview document has no head.");
	}
	const script = buildHighlightScript({
		selector,
		token,
		negativeVerdictMs: PREVIEW_NEGATIVE_VERDICT_MS,
	});
	prependChildren(head, buildHeadNodes({ finalUrl, script }));
	return serialize(document);
};

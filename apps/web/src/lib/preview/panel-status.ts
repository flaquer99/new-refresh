import type { FindingPreviewState } from "@/hooks/use-finding-preview";
import {
	type HighlightState,
	LOADING_HIGHLIGHT,
	type PreviewStatusValue,
} from "./preview-messages";

export const toPanelStatus = (
	preview: FindingPreviewState,
	highlight: HighlightState,
): PreviewStatusValue => {
	if (preview === "loading") {
		return { kind: "highlight", state: LOADING_HIGHLIGHT };
	}
	if (!preview.ok) {
		return { kind: "request-error" };
	}
	if (preview.data.kind === "unavailable") {
		const { reason, httpStatus } = preview.data;
		return { kind: "unavailable", reason, httpStatus };
	}
	return { kind: "highlight", state: highlight };
};

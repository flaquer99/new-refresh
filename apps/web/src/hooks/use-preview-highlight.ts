import { PREVIEW_HIGHLIGHT_WAIT_MS } from "@refresh/scan-contracts/preview";
import { PreviewHighlightMessageSchema } from "@refresh/scan-contracts/preview-ui";
import { type RefObject, useEffect, useState } from "react";
import {
	type HighlightState,
	LOADING_HIGHLIGHT,
} from "@/lib/preview/preview-messages";

const NO_RESPONSE: HighlightState = { outcome: "no-response", matchCount: 0 };

type PreviewHighlightParams = {
	frame: RefObject<HTMLIFrameElement | null>;
	token: string | null;
};

export function usePreviewHighlight({
	frame,
	token,
}: PreviewHighlightParams): HighlightState {
	const [state, setState] = useState<HighlightState>(LOADING_HIGHLIGHT);
	useEffect(() => {
		if (token === null) {
			return;
		}
		setState(LOADING_HIGHLIGHT);
		let settled = false;
		const settle = (next: HighlightState) => {
			settled = true;
			setState(next);
		};
		const onMessage = (event: MessageEvent) => {
			if (settled || event.source !== frame.current?.contentWindow) {
				return;
			}
			const parsed = PreviewHighlightMessageSchema.safeParse(event.data);
			if (!parsed.success || parsed.data.token !== token) {
				return;
			}
			settle({
				outcome: parsed.data.outcome,
				matchCount: parsed.data.matchCount,
			});
		};
		const timer = setTimeout(() => {
			if (!settled) {
				settle(NO_RESPONSE);
			}
		}, PREVIEW_HIGHLIGHT_WAIT_MS);
		window.addEventListener("message", onMessage);
		return () => {
			clearTimeout(timer);
			window.removeEventListener("message", onMessage);
		};
	}, [frame, token]);
	return state;
}

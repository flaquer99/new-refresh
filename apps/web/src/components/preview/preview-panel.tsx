import type { Viewport } from "@refresh/scan-contracts/findings";
import { useRef } from "react";
import { useFindingPreview } from "@/hooks/use-finding-preview";
import { usePreviewHighlight } from "@/hooks/use-preview-highlight";
import { toPanelStatus } from "@/lib/preview/panel-status";
import { PreviewLoaded } from "./preview-loaded";
import { PreviewStatus } from "./preview-status";
import { PreviewUnavailable } from "./preview-unavailable";

type PreviewPanelProps = {
	scanId: string;
	findingId: string;
	pageUrl: string;
	viewports: readonly Viewport[];
	onRetry: () => void;
};

export function PreviewPanel({
	scanId,
	findingId,
	pageUrl,
	viewports,
	onRetry,
}: PreviewPanelProps) {
	const preview = useFindingPreview({ scanId, findingId });
	const frameRef = useRef<HTMLIFrameElement | null>(null);
	const loaded =
		preview !== "loading" && preview.ok && preview.data.kind === "loaded"
			? preview.data
			: null;
	const highlight = usePreviewHighlight({
		frame: frameRef,
		token: loaded?.token ?? null,
	});
	return (
		<div className="flex flex-col gap-3">
			<PreviewStatus status={toPanelStatus(preview, highlight)} />
			{loaded ? (
				<PreviewLoaded
					frameRef={frameRef}
					preview={loaded}
					viewports={viewports}
				/>
			) : null}
			{preview !== "loading" && !loaded ? (
				<PreviewUnavailable
					onRetry={preview.ok ? undefined : onRetry}
					pageUrl={pageUrl}
				/>
			) : null}
		</div>
	);
}

import type { Viewport } from "@refresh/scan-contracts/findings";
import type { FindingPreview } from "@refresh/scan-contracts/preview-ui";
import type { RefObject } from "react";
import { usePreviewViewport } from "@/hooks/use-preview-viewport";
import { PreviewFrame } from "./preview-frame";
import { PreviewToolbar } from "./preview-toolbar";

type LoadedPreview = Extract<FindingPreview, { kind: "loaded" }>;

type PreviewLoadedProps = {
	preview: LoadedPreview;
	viewports: readonly Viewport[];
	frameRef: RefObject<HTMLIFrameElement | null>;
};

export function PreviewLoaded({
	preview,
	viewports,
	frameRef,
}: PreviewLoadedProps) {
	const { viewport, options, select } = usePreviewViewport(viewports);
	return (
		<div className="flex flex-col gap-3">
			<PreviewToolbar
				finalUrl={preview.finalUrl}
				onSelect={select}
				options={options}
				pageUrl={preview.pageUrl}
				viewport={viewport}
			/>
			<PreviewFrame
				document={preview.document}
				pageUrl={preview.pageUrl}
				ref={frameRef}
				viewport={viewport}
			/>
		</div>
	);
}

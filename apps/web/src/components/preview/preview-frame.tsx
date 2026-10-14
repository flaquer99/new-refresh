import type { Viewport } from "@refresh/scan-contracts/findings";
import { PREVIEW_VIEWPORT_SIZES } from "@refresh/scan-contracts/preview";
import type { Ref } from "react";
import { useElementWidth } from "@/hooks/use-element-width";
import { frameScale } from "@/lib/preview/frame-scale";

const SANDBOX = "allow-scripts";

type PreviewFrameProps = {
	document: string;
	pageUrl: string;
	viewport: Viewport;
	ref: Ref<HTMLIFrameElement>;
};

export function PreviewFrame({
	document,
	pageUrl,
	viewport,
	ref,
}: PreviewFrameProps) {
	const { ref: containerRef, width } = useElementWidth<HTMLDivElement>();
	const size = PREVIEW_VIEWPORT_SIZES[viewport];
	const scale = frameScale({ containerWidth: width, frameWidth: size.width });
	return (
		<div
			className="w-full overflow-hidden rounded-md border border-border"
			ref={containerRef}
			style={{ height: size.height * scale }}
		>
			<iframe
				data-preview-frame
				data-viewport={viewport}
				height={size.height}
				ref={ref}
				referrerPolicy="no-referrer"
				sandbox={SANDBOX}
				srcDoc={document}
				style={{
					width: size.width,
					height: size.height,
					transform: `scale(${scale})`,
					transformOrigin: "top left",
					border: 0,
				}}
				tabIndex={-1}
				title={`Live preview of ${pageUrl}`}
				width={size.width}
			/>
		</div>
	);
}

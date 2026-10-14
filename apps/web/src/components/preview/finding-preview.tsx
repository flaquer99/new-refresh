"use client";

import type { Viewport } from "@refresh/scan-contracts/findings";
import { useId, useState } from "react";
import { PreviewPanel } from "./preview-panel";
import { PreviewToggle } from "./preview-toggle";

type FindingPreviewProps = {
	scanId: string;
	findingId: string;
	pageUrl: string;
	viewports: readonly Viewport[];
	headingId: string;
};

export function FindingPreview({
	scanId,
	findingId,
	pageUrl,
	viewports,
	headingId,
}: FindingPreviewProps) {
	const panelId = useId();
	const [open, setOpen] = useState(false);
	const [attempt, setAttempt] = useState(0);
	return (
		<div className="flex min-w-0 flex-col gap-3">
			<PreviewToggle
				controls={panelId}
				describedBy={headingId}
				onToggle={() => setOpen((current) => !current)}
				open={open}
			/>
			<div id={panelId}>
				{open ? (
					<PreviewPanel
						findingId={findingId}
						key={attempt}
						onRetry={() => setAttempt((current) => current + 1)}
						pageUrl={pageUrl}
						scanId={scanId}
						viewports={viewports}
					/>
				) : null}
			</div>
		</div>
	);
}

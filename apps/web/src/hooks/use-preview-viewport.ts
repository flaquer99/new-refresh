import type { Viewport } from "@refresh/scan-contracts/findings";
import { useState } from "react";

const VIEWPORT_ORDER: readonly Viewport[] = ["desktop", "mobile"];

export function usePreviewViewport(viewports: readonly Viewport[]) {
	const options = VIEWPORT_ORDER.filter((viewport) =>
		viewports.includes(viewport),
	);
	const [selected, setSelected] = useState<Viewport | null>(null);
	const viewport =
		selected && options.includes(selected)
			? selected
			: (options[0] ?? "desktop");
	return { viewport, options, select: setSelected };
}

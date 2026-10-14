import type { FrameWindow } from "./highlight-types";

export function drawOverlay(doc: Document, element: Element): () => void {
	const win = doc.defaultView as FrameWindow;
	const overlay = doc.createElement("div");
	overlay.setAttribute("data-refresh-highlight", "");
	overlay.setAttribute("aria-hidden", "true");
	overlay.style.cssText =
		"position:absolute;pointer-events:none;z-index:2147483647;box-sizing:border-box;outline:2px solid #000;box-shadow:0 0 0 3px #ffd400;";
	const reposition = () => {
		const box = element.getBoundingClientRect();
		overlay.style.top = `${box.top + win.scrollY}px`;
		overlay.style.left = `${box.left + win.scrollX}px`;
		overlay.style.width = `${box.width}px`;
		overlay.style.height = `${box.height}px`;
	};
	reposition();
	doc.documentElement.appendChild(overlay);
	win.addEventListener("load", reposition);
	win.addEventListener("resize", reposition);
	if (typeof win.ResizeObserver === "function") {
		new win.ResizeObserver(reposition).observe(element);
	}
	return reposition;
}

export function isRendered(win: Window, element: Element): boolean {
	const box = element.getBoundingClientRect();
	if (box.width === 0 || box.height === 0) {
		return false;
	}
	const style = win.getComputedStyle(element);
	return style.display !== "none" && style.visibility !== "hidden";
}

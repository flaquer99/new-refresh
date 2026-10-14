export function lockInteraction(doc: Document): void {
	const blockedEvents = ["click", "auxclick", "submit"];
	const focusableSelector =
		"a[href],button,input,select,textarea,summary,iframe,[tabindex],[contenteditable]";
	for (const type of blockedEvents) {
		doc.addEventListener(type, (event) => event.preventDefault(), true);
	}
	for (const focusable of doc.querySelectorAll(focusableSelector)) {
		focusable.setAttribute("tabindex", "-1");
	}
}

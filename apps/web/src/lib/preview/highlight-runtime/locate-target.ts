import type { LocateResult } from "./highlight-types";

export function locateTarget(doc: Document, selector: string): LocateResult {
	if (selector.includes(" >>> ")) {
		return { outcome: "unsupported-selector", element: null, matchCount: 0 };
	}
	try {
		const matches = doc.querySelectorAll(selector);
		if (matches.length === 0) {
			return { outcome: "not-found", element: null, matchCount: 0 };
		}
		return {
			outcome: "found",
			element: matches[0] ?? null,
			matchCount: matches.length,
		};
	} catch {
		return { outcome: "unsupported-selector", element: null, matchCount: 0 };
	}
}

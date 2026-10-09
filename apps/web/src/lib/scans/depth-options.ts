import { MAX_PAGES } from "@refresh/scan-contracts/limits";

export const DEFAULT_DEPTH = 0;

export const DEPTH_OPTIONS = [
	{ value: 0, label: "0 — Only this page" },
	{ value: 1, label: "1 — This page and the pages it links to" },
	{ value: 2, label: "2 — Pages up to two links away" },
	{ value: 3, label: "3 — Pages up to three links away" },
] as const;

export const DEPTH_HINT = `How many links to follow from this page on the same site. A scan covers at most ${MAX_PAGES} pages.`;

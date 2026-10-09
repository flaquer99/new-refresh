import type {
	CriterionRef,
	ManualCheck,
	ReviewItem,
	Violation,
} from "@refresh/scan-contracts/findings";

export const START_URL = "https://www.example.org/";

export const NON_TEXT_CONTENT: CriterionRef = {
	id: "1.1.1",
	name: "Non-text Content",
	level: "A",
	understandingUrl:
		"https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html",
};

export const CONTRAST_MINIMUM: CriterionRef = {
	id: "1.4.3",
	name: "Contrast (Minimum)",
	level: "AA",
	understandingUrl:
		"https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
};

export const buildViolation = (
	overrides: Partial<Violation> = {},
): Violation => ({
	id: "violation-1",
	ruleId: "image-alt",
	criteria: [NON_TEXT_CONTENT],
	level: "A",
	severity: "critical",
	pageUrl: START_URL,
	selector: "main > img.hero",
	html: '<img class="hero" src="hero.png">',
	viewports: ["desktop", "mobile"],
	description: "Images must have alternative text",
	fixGuidance:
		"Fix any of the following:\n  Element does not have an alt attribute",
	...overrides,
});

export const buildReviewItem = (
	overrides: Partial<ReviewItem> = {},
): ReviewItem => ({
	id: "review-1",
	ruleId: "color-contrast",
	criteria: [CONTRAST_MINIMUM],
	pageUrl: START_URL,
	selector: "header > p",
	html: "<p>Over an image</p>",
	viewports: ["desktop"],
	guidance: "Check the contrast of text over the background image.",
	...overrides,
});

export const buildManualCheck = (
	overrides: Partial<ManualCheck> = {},
): ManualCheck => ({
	criterion: CONTRAST_MINIMUM,
	scope: "page",
	pages: [START_URL],
	guidance: "Check text over images and gradients by hand.",
	...overrides,
});

import type {
	CriterionRef,
	ReviewItem,
	Viewport,
	Violation,
} from "@refresh/scan-contracts/findings";

const BLOCKED_PAGE_URL = "http://10.0.0.5/";
const BOTH_VIEWPORTS: Viewport[] = ["desktop", "mobile"];
const CONTRAST: CriterionRef = {
	id: "1.4.3",
	name: "Contrast (Minimum)",
	level: "AA",
	understandingUrl:
		"https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
};

export type Origins = { fixtures: string; closed: string };

type FindingSpec = {
	id: string;
	pageUrl: string;
	selector: string;
	viewports?: Viewport[];
};

const violation = ({
	id,
	pageUrl,
	selector,
	viewports = BOTH_VIEWPORTS,
}: FindingSpec): Violation => ({
	id,
	ruleId: "color-contrast",
	criteria: [CONTRAST],
	level: "AA",
	severity: "serious",
	pageUrl,
	selector,
	html: `<p data-seed="${id}">Seeded finding</p>`,
	viewports,
	description: `Seeded ${id}`,
	fixGuidance: "Raise the contrast ratio.",
});

const reviewItem = (spec: FindingSpec): ReviewItem => ({
	id: spec.id,
	ruleId: `seed-${spec.id}`,
	criteria: [CONTRAST],
	pageUrl: spec.pageUrl,
	selector: spec.selector,
	html: `<p data-seed="${spec.id}">Seeded review item</p>`,
	viewports: spec.viewports ?? BOTH_VIEWPORTS,
	guidance: "Check the contrast by eye.",
});

const violationSpecs = ({ fixtures, closed }: Origins): FindingSpec[] => [
	{
		id: "mobile-only",
		pageUrl: `${fixtures}/low-contrast/`,
		selector: ".faint",
		viewports: ["mobile"],
	},
	{ id: "both", pageUrl: `${fixtures}/low-contrast/`, selector: ".faint" },
	{
		id: "missing-route",
		pageUrl: `${fixtures}/page-coverage/missing.html`,
		selector: "main",
	},
	{
		id: "removed",
		pageUrl: `${fixtures}/low-contrast/`,
		selector: "#removed-element",
	},
	{
		id: "hidden",
		pageUrl: `${fixtures}/preview/hidden.html`,
		selector: "#hidden-target",
	},
	{
		id: "duplicates",
		pageUrl: `${fixtures}/preview/duplicates.html`,
		selector: ".repeat",
	},
	{
		id: "hostile",
		pageUrl: `${fixtures}/preview/hostile.html`,
		selector: "#target",
	},
	{
		id: "shadow",
		pageUrl: `${fixtures}/low-contrast/`,
		selector: "my-widget >>> button",
	},
	{ id: "blocked", pageUrl: BLOCKED_PAGE_URL, selector: "main" },
	{ id: "closed", pageUrl: `${closed}/`, selector: "main" },
];

export const buildPreviewFindings = (origins: Origins) => ({
	violations: violationSpecs(origins).map(violation),
	reviewItems: [
		reviewItem({
			id: "review",
			pageUrl: `${origins.fixtures}/low-contrast/`,
			selector: ".faint",
		}),
	],
});

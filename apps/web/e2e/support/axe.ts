import { AxeBuilder } from "@axe-core/playwright";
import type { Page } from "@playwright/test";

const WCAG_A_AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const EMBEDDED_PREVIEW_FRAME = "[data-preview-frame]";
const AXE_OPTIONS = { rules: { "target-size": { enabled: true } } };

export type AxeFinding = {
	rule: string;
	targets: string[];
};

export const findWcagViolations = async (page: Page): Promise<AxeFinding[]> => {
	const results = await new AxeBuilder({ page })
		.exclude(EMBEDDED_PREVIEW_FRAME)
		.options(AXE_OPTIONS)
		.withTags(WCAG_A_AA_TAGS)
		.analyze();
	return results.violations.map(({ id, nodes }) => ({
		rule: id,
		targets: nodes.map(({ target }) => target.join(" ")),
	}));
};

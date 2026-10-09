import { AxeBuilder } from "@axe-core/playwright";
import type { Page } from "playwright";
import type { AxeResults, AxeRuleResult } from "../report/axe-results.js";

export const AXE_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
] as const;
export const AXE_OPTIONS = {
  rules: { "target-size": { enabled: true } },
} as const;

type Result = Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"][number];
type AxeTarget = Result["nodes"][number]["target"][number];

const flattenTarget = (target: AxeTarget): string | string[] =>
  typeof target === "string" ? target : target.flat(Number.POSITIVE_INFINITY);

const toRuleResult = ({ id, help, tags, nodes }: Result): AxeRuleResult => ({
  id,
  help,
  tags,
  nodes: nodes.map(({ target, html, impact, failureSummary }) => ({
    target: target.map(flattenTarget),
    html,
    impact,
    failureSummary,
  })),
});

export const runAxe = async (page: Page): Promise<AxeResults> => {
  const results = await new AxeBuilder({ page })
    .options(AXE_OPTIONS)
    .withTags([...AXE_TAGS])
    .analyze();
  return {
    violations: results.violations.map(toRuleResult),
    incomplete: results.incomplete.map(toRuleResult),
  };
};

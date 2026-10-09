import { createHash } from "node:crypto";
import type { CriterionRef, Viewport } from "@refresh/scan-contracts/findings";
import type {
  AxeNodeResult,
  AxeResults,
  AxeRuleResult,
  AxeRun,
  AxeSelector,
} from "./axe-results.js";
import { criteriaFromTags } from "./axe-tags.js";

export const HTML_SNIPPET_MAX = 500;
const SELECTOR_SEPARATOR = " >>> ";
const FINDING_ID_LENGTH = 16;
const FINDING_ID_ALGORITHM = "sha256";

export type BaseFinding = {
  id: string;
  ruleId: string;
  criteria: CriterionRef[];
  pageUrl: string;
  selector: string;
  html: string;
  viewports: Viewport[];
};

export type NodeFinding = {
  rule: AxeRuleResult;
  node: AxeNodeResult;
  base: BaseFinding;
};

type NodeContext = {
  run: AxeRun;
  rule: AxeRuleResult;
  criteria: CriterionRef[];
};

const joinSelector = (part: AxeSelector): string =>
  typeof part === "string" ? part : part.join(SELECTOR_SEPARATOR);

const toSelector = (target: readonly AxeSelector[]): string =>
  target.map(joinSelector).join(SELECTOR_SEPARATOR);

const findingId = (parts: readonly string[]): string =>
  createHash(FINDING_ID_ALGORITHM)
    .update(parts.join("\n"))
    .digest("hex")
    .slice(0, FINDING_ID_LENGTH);

const toNodeFinding =
  ({ run, rule, criteria }: NodeContext) =>
  (node: AxeNodeResult): NodeFinding => {
    const selector = toSelector(node.target);
    return {
      rule,
      node,
      base: {
        id: findingId([rule.id, run.pageUrl, selector]),
        ruleId: rule.id,
        criteria,
        pageUrl: run.pageUrl,
        selector,
        html: node.html.slice(0, HTML_SNIPPET_MAX),
        viewports: [run.viewport],
      },
    };
  };

const ruleFindings = (run: AxeRun, rule: AxeRuleResult): NodeFinding[] => {
  const criteria = criteriaFromTags(rule.tags);
  if (criteria.length === 0) {
    return [];
  }
  return rule.nodes.map(toNodeFinding({ run, rule, criteria }));
};

export const collectNodeFindings = (
  runs: readonly AxeRun[],
  kind: keyof AxeResults,
): NodeFinding[] =>
  runs.flatMap((run) =>
    run.results[kind].flatMap((rule) => ruleFindings(run, rule)),
  );

export const nodeGuidance = ({ rule, node }: NodeFinding): string =>
  node.failureSummary?.trim() ? node.failureSummary : rule.help;

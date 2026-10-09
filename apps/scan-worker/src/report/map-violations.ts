import {
  type CriterionRef,
  SEVERITIES,
  type Severity,
  type Violation,
  type WcagLevel,
} from "@refresh/scan-contracts/findings";
import { compareCriterionIds } from "../wcag/compare-criterion-ids.js";
import type { AxeRun } from "./axe-results.js";
import { mergeViewports } from "./merge-viewports.js";
import {
  collectNodeFindings,
  type NodeFinding,
  nodeGuidance,
} from "./node-finding.js";

const DEFAULT_SEVERITY: Severity = "moderate";

const strictestLevel = (criteria: readonly CriterionRef[]): WcagLevel =>
  criteria.some((criterion) => criterion.level === "A") ? "A" : "AA";

const toViolation = (finding: NodeFinding): Violation => ({
  ...finding.base,
  level: strictestLevel(finding.base.criteria),
  severity: finding.node.impact ?? DEFAULT_SEVERITY,
  description: finding.rule.help,
  fixGuidance: nodeGuidance(finding),
});

const primaryCriterionId = (violation: Violation): string =>
  violation.criteria[0]?.id ?? "";

const compareViolations = (left: Violation, right: Violation): number =>
  SEVERITIES.indexOf(left.severity) - SEVERITIES.indexOf(right.severity) ||
  compareCriterionIds(primaryCriterionId(left), primaryCriterionId(right));

export const mapViolations = (runs: readonly AxeRun[]): Violation[] =>
  mergeViewports(collectNodeFindings(runs, "violations").map(toViolation)).sort(
    compareViolations,
  );

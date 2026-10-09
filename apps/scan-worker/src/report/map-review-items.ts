import type { ReviewItem } from "@refresh/scan-contracts/findings";
import type { AxeRun } from "./axe-results.js";
import { mergeViewports } from "./merge-viewports.js";
import {
  collectNodeFindings,
  type NodeFinding,
  nodeGuidance,
} from "./node-finding.js";

const toReviewItem = (finding: NodeFinding): ReviewItem => ({
  ...finding.base,
  guidance: nodeGuidance(finding),
});

export const mapReviewItems = (runs: readonly AxeRun[]): ReviewItem[] =>
  mergeViewports(collectNodeFindings(runs, "incomplete").map(toReviewItem));

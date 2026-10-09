import type { Severity, Viewport } from "@refresh/scan-contracts/findings";

export type AxeSelector = string | readonly string[];

export type AxeNodeResult = {
  target: readonly AxeSelector[];
  html: string;
  impact?: Severity | null;
  failureSummary?: string;
};

export type AxeRuleResult = {
  id: string;
  help: string;
  tags: readonly string[];
  nodes: readonly AxeNodeResult[];
};

export type AxeResults = {
  violations: readonly AxeRuleResult[];
  incomplete: readonly AxeRuleResult[];
};

export type AxeRun = {
  pageUrl: string;
  viewport: Viewport;
  results: AxeResults;
};

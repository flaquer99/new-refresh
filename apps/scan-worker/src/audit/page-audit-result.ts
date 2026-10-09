import type { Viewport } from "@refresh/scan-contracts/findings";
import type { PageProbeMatches } from "../report/aggregate-manual-checks.js";
import type { AxeRun } from "../report/axe-results.js";
import type { LoadRejection } from "./classify-response.js";

export type PageFindings = {
  axeRuns: AxeRun[];
  probeMatches: PageProbeMatches;
};

export type PageAuditResult =
  | {
      kind: "audited";
      finalUrl: string;
      links: string[];
      findings: PageFindings;
      durationsMs: Partial<Record<Viewport, number>>;
    }
  | LoadRejection;

export type PageAuditInput = { url: string; isStartPage: boolean };

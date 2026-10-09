import type { Viewport } from "@refresh/scan-contracts/findings";
import { normalizeUrl } from "../crawl/normalize-url.js";
import type { AxeRun } from "../report/axe-results.js";
import type { ViewportAudit } from "./audit-viewport.js";
import type { ViewportContexts } from "./create-contexts.js";
import { DEFAULT_LOAD_TIMEOUTS, type LoadTimeouts } from "./load-page.js";
import type { PageAuditInput, PageAuditResult } from "./page-audit-result.js";
import { settleRefusal, type TargetPolicy } from "./settle-refusal.js";
import { type PassDurations, timedPass } from "./timed-pass.js";

export type PageAuditor = {
  audit: (input: PageAuditInput) => Promise<PageAuditResult>;
};

export type PageAuditorOptions = {
  contexts: ViewportContexts;
  policy: TargetPolicy;
  timeouts?: LoadTimeouts;
};

const toAxeRun =
  (pageUrl: string) =>
  ({ viewport, results }: ViewportAudit): AxeRun => ({
    pageUrl,
    viewport,
    results,
  });

type CombineInput = {
  desktop: ViewportAudit;
  mobile: ViewportAudit | null;
  durationsMs: PassDurations;
};

const combine = ({
  desktop,
  mobile,
  durationsMs,
}: CombineInput): PageAuditResult => {
  const finalUrl = normalizeUrl(desktop.finalUrl);
  const { links } = desktop;
  const passes = mobile ? [desktop, mobile] : [desktop];
  const probeIds = [...new Set(passes.flatMap((pass) => pass.probeIds))];
  return {
    kind: "audited",
    finalUrl,
    links,
    findings: {
      axeRuns: passes.map(toAxeRun(finalUrl)),
      probeMatches: { pageUrl: finalUrl, probeIds },
    },
    durationsMs,
  };
};

export const createPageAuditor = ({
  contexts,
  policy,
  timeouts = DEFAULT_LOAD_TIMEOUTS,
}: PageAuditorOptions): PageAuditor => {
  const pass = (url: string, viewport: Viewport, durationsMs: PassDurations) =>
    timedPass({ contexts, timeouts, url, viewport }, durationsMs);
  return {
    audit: async ({ url }) => {
      const durationsMs: PassDurations = {};
      const desktop = await pass(url, "desktop", durationsMs);
      if (desktop.kind !== "audited") {
        return settleRefusal(desktop, policy);
      }
      const mobile = await pass(url, "mobile", durationsMs);
      const mobileAudit = mobile.kind === "audited" ? mobile : null;
      return combine({ desktop, mobile: mobileAudit, durationsMs });
    },
  };
};

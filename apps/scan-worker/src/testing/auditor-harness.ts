import type { Violation } from "@refresh/scan-contracts/findings";
import type { Browser } from "playwright";
import type { PageAuditResult } from "../audit/page-audit-result.js";
import { launchGuardedBrowser } from "../browser/launch-browser.js";
import { mapViolations } from "../report/map-violations.js";
import { type GuardHarness, startGuardHarness } from "./guard-harness.js";

export type AuditorHarness = {
  harness: GuardHarness;
  browser: Browser;
  origin: string;
  close: () => Promise<void>;
};

export const startAuditorHarness = async (): Promise<AuditorHarness> => {
  const harness = await startGuardHarness();
  const browser = await launchGuardedBrowser(harness.guard);
  return {
    harness,
    browser,
    origin: harness.fixtures.origin,
    close: async () => {
      await browser.close();
      await harness.close();
    },
  };
};

export const audited = (result: PageAuditResult) => {
  if (result.kind !== "audited") {
    throw new Error(`Expected an audited page, got ${result.kind}`);
  }
  return result;
};

export const violationsOf = (result: PageAuditResult): Violation[] =>
  mapViolations(audited(result).findings.axeRuns);

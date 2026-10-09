import type { Viewport } from "@refresh/scan-contracts/findings";
import type { Page } from "playwright";
import type { PageProbeId } from "../wcag/manual-probe-ids.js";
import { matchComputedProbes } from "./computed-probes.js";
import { PROBE_SELECTORS, type SelectorProbeId } from "./probe-selectors.js";

const isSelectorProbeId = (id: string): id is SelectorProbeId =>
  Object.hasOwn(PROBE_SELECTORS, id);

const matchSelectorProbes = async (page: Page): Promise<SelectorProbeId[]> => {
  const matched = await page.evaluate(
    (selectors) =>
      Object.entries(selectors)
        .filter(([, selector]) => document.querySelector(selector) !== null)
        .map(([probeId]) => probeId),
    PROBE_SELECTORS,
  );
  return matched.filter(isSelectorProbeId);
};

export const runManualProbes = async (
  page: Page,
  viewport: Viewport,
): Promise<PageProbeId[]> => [
  ...(await matchSelectorProbes(page)),
  ...(await matchComputedProbes(page, viewport)),
];

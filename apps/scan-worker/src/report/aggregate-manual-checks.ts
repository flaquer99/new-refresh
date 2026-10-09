import type { ManualCheck } from "@refresh/scan-contracts/findings";
import { compareCriterionIds } from "../wcag/compare-criterion-ids.js";
import { findCriterion } from "../wcag/find-criterion.js";
import {
  MANUAL_CHECKS,
  type ManualCheckDefinition,
} from "../wcag/manual-checks.js";
import {
  ALWAYS_PROBE,
  type PageProbeId,
  SITE_PROBE_MIN_PAGES,
} from "../wcag/manual-probe-ids.js";

export type PageProbeMatches = {
  pageUrl: string;
  probeIds: readonly PageProbeId[];
};

const urlsOf = (pages: readonly PageProbeMatches[]): string[] =>
  pages.map(({ pageUrl }) => pageUrl);

const matchingPages = (
  definition: ManualCheckDefinition,
  pages: readonly PageProbeMatches[],
): string[] => {
  if (definition.scope === "site") {
    const minPages = SITE_PROBE_MIN_PAGES[definition.probeId];
    return pages.length >= minPages ? urlsOf(pages) : [];
  }
  if (definition.probeId === ALWAYS_PROBE) {
    return urlsOf(pages);
  }
  const { probeId } = definition;
  return urlsOf(pages.filter((page) => page.probeIds.includes(probeId)));
};

const toManualCheck =
  (pages: readonly PageProbeMatches[]) =>
  (definition: ManualCheckDefinition): ManualCheck[] => {
    const criterion = findCriterion(definition.criterionId);
    const urls = matchingPages(definition, pages);
    if (!criterion || urls.length === 0) {
      return [];
    }
    const { scope, guidance } = definition;
    return [{ criterion, scope, pages: urls, guidance }];
  };

export const aggregateManualChecks = (
  pages: readonly PageProbeMatches[],
): ManualCheck[] =>
  MANUAL_CHECKS.flatMap(toManualCheck(pages)).sort((left, right) =>
    compareCriterionIds(left.criterion.id, right.criterion.id),
  );

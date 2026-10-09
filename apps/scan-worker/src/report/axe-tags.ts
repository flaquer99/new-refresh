import type { CriterionRef } from "@refresh/scan-contracts/findings";
import { compareCriterionIds } from "../wcag/compare-criterion-ids.js";
import { findCriterion } from "../wcag/find-criterion.js";

// Matches success-criterion tags such as "wcag143" (1.4.3) or "wcag1410" (1.4.10),
// capturing principle, guideline, and criterion digits; level tags like "wcag21aa" don't match
const WCAG_CRITERION_TAG = /^wcag(\d)(\d)(\d{1,2})$/;

const EXCLUDED_TAGS: ReadonlySet<string> = new Set([
  "experimental",
  "wcag2a-obsolete",
]);

export const parseWcagTag = (tag: string): string | null => {
  const match = WCAG_CRITERION_TAG.exec(tag);
  if (!match) {
    return null;
  }
  const [, principle, guideline, criterion] = match;
  return `${principle}.${guideline}.${criterion}`;
};

export const criteriaFromTags = (tags: readonly string[]): CriterionRef[] => {
  if (tags.some((tag) => EXCLUDED_TAGS.has(tag))) {
    return [];
  }
  const ids = new Set(tags.map(parseWcagTag));
  return [...ids]
    .map((id) => (id ? findCriterion(id) : undefined))
    .filter((criterion): criterion is CriterionRef => criterion !== undefined)
    .sort((left, right) => compareCriterionIds(left.id, right.id));
};

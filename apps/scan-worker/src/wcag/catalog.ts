import type { CriterionRef } from "@refresh/scan-contracts/findings";
import { OPERABLE_CRITERIA } from "./criteria-operable.js";
import { PERCEIVABLE_CRITERIA } from "./criteria-perceivable.js";
import { ROBUST_CRITERIA } from "./criteria-robust.js";
import { UNDERSTANDABLE_CRITERIA } from "./criteria-understandable.js";

const UNDERSTANDING_BASE_URL = "https://www.w3.org/WAI/WCAG22/Understanding/";
const NON_SLUG_CHARACTERS = /[^a-z0-9]+/g;
const EDGE_HYPHENS = /^-|-$/g;

type CriterionEntry = Omit<CriterionRef, "understandingUrl">;

const toSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(NON_SLUG_CHARACTERS, "-")
    .replace(EDGE_HYPHENS, "");

const toCriterionRef = ({ id, name, level }: CriterionEntry): CriterionRef => ({
  id,
  name,
  level,
  understandingUrl: `${UNDERSTANDING_BASE_URL}${toSlug(name)}.html`,
});

export const WCAG_CRITERIA: readonly CriterionRef[] = [
  ...PERCEIVABLE_CRITERIA,
  ...OPERABLE_CRITERIA,
  ...UNDERSTANDABLE_CRITERIA,
  ...ROBUST_CRITERIA,
].map(toCriterionRef);

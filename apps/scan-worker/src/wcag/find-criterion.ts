import type { CriterionRef } from "@refresh/scan-contracts/findings";
import { WCAG_CRITERIA } from "./catalog.js";

const CRITERIA_BY_ID = new Map(
  WCAG_CRITERIA.map((criterion) => [criterion.id, criterion]),
);

export const findCriterion = (id: string): CriterionRef | undefined =>
  CRITERIA_BY_ID.get(id);

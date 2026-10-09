import { OPERABLE_GUIDANCE } from "./manual-guidance-operable.js";
import { PERCEIVABLE_GUIDANCE } from "./manual-guidance-perceivable.js";
import { UNDERSTANDABLE_GUIDANCE } from "./manual-guidance-understandable.js";
import {
  PAGE_PROBE_CRITERIA,
  type PageProbeId,
  SITE_PROBE_CRITERIA,
  type SiteProbeId,
} from "./manual-probe-ids.js";

type CheckDefinition<P> = {
  criterionId: string;
  probeId: P;
  guidance: string;
};

export type ManualCheckDefinition =
  | (CheckDefinition<PageProbeId> & { scope: "page" })
  | (CheckDefinition<SiteProbeId> & { scope: "site" });

const GUIDANCE: Readonly<Record<string, string>> = {
  ...PERCEIVABLE_GUIDANCE,
  ...OPERABLE_GUIDANCE,
  ...UNDERSTANDABLE_GUIDANCE,
};

const entriesOf = <K extends string, V>(record: Readonly<Record<K, V>>) =>
  Object.entries(record) as [K, V][];

const toDefinitions = <P extends string>(
  probeCriteria: Readonly<Record<P, readonly string[]>>,
): CheckDefinition<P>[] =>
  entriesOf(probeCriteria).flatMap(([probeId, criterionIds]) =>
    criterionIds.map((criterionId) => ({
      criterionId,
      probeId,
      guidance: GUIDANCE[criterionId] ?? "",
    })),
  );

export const MANUAL_CHECKS: readonly ManualCheckDefinition[] = [
  ...toDefinitions(PAGE_PROBE_CRITERIA).map((definition) => ({
    ...definition,
    scope: "page" as const,
  })),
  ...toDefinitions(SITE_PROBE_CRITERIA).map((definition) => ({
    ...definition,
    scope: "site" as const,
  })),
];

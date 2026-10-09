import { describe, expect, it } from "vitest";
import { violationsOf } from "../testing/auditor-harness.js";
import { useAuditor } from "../testing/use-auditor.js";

const SEEDED_VIOLATIONS = [
  { fixture: "missing-alt", ruleId: "image-alt" },
  { fixture: "low-contrast", ruleId: "color-contrast" },
  { fixture: "small-targets", ruleId: "target-size" },
  { fixture: "late-injection", ruleId: "image-alt" },
] as const;

describe("PageAuditor seeded-violation suite", () => {
  const auditor = useAuditor();

  it.each(SEEDED_VIOLATIONS)(
    "finds the seeded $ruleId violation on the $fixture fixture",
    async ({ fixture, ruleId }) => {
      // WHEN
      const result = await auditor.audit(`/${fixture}/`);

      // THEN
      expect(violationsOf(result).map((v) => v.ruleId)).toContain(ruleId);
    },
  );

  it("reports no violations on the clean fixture", async () => {
    // WHEN
    const result = await auditor.audit("/clean/");

    // THEN
    expect(violationsOf(result)).toEqual([]);
  });
});

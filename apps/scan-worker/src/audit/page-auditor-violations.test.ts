import { describe, expect, it } from "vitest";
import { violationsOf } from "../testing/auditor-harness.js";
import { useAuditor } from "../testing/use-auditor.js";

describe("PageAuditor violations", () => {
  const auditor = useAuditor();

  it("reports a missing alt text as a 1.1.1 Level A violation with selector and html", async () => {
    // WHEN
    const result = await auditor.audit("/missing-alt/");

    // THEN
    const imageAlt = violationsOf(result).filter(
      (v) => v.ruleId === "image-alt",
    );
    expect(imageAlt).toEqual([
      expect.objectContaining({
        criteria: [expect.objectContaining({ id: "1.1.1", level: "A" })],
        selector: "#unlabelled-chart",
        html: expect.stringContaining('<img id="unlabelled-chart"'),
      }),
    ]);
  });

  it("reports text below 4.5:1 as a 1.4.3 Level AA violation", async () => {
    // WHEN
    const result = await auditor.audit("/low-contrast/");

    // THEN
    const contrast = violationsOf(result).filter(
      (v) => v.ruleId === "color-contrast",
    );
    expect(contrast.map((v) => v.criteria)).toEqual([
      [expect.objectContaining({ id: "1.4.3", level: "AA" })],
    ]);
  });

  it("reports no violations when the only failure is AAA contrast", async () => {
    // WHEN
    const result = await auditor.audit("/aaa-contrast/");

    // THEN
    expect(violationsOf(result)).toEqual([]);
  });

  it("reports targets that are small only at mobile width for the mobile viewport only", async () => {
    // WHEN
    const result = await auditor.audit("/small-targets/");

    // THEN
    const targets = violationsOf(result).filter(
      (v) => v.ruleId === "target-size",
    );
    const mobileOnlyTarget = expect.objectContaining({
      criteria: [expect.objectContaining({ id: "2.5.8" })],
      viewports: ["mobile"],
    });
    expect(targets).toEqual([
      mobileOnlyTarget,
      mobileOnlyTarget,
      mobileOnlyTarget,
    ]);
  });

  it("audits an element injected after the load event", async () => {
    // WHEN
    const result = await auditor.audit("/late-injection/");

    // THEN
    const selectors = violationsOf(result).map((v) => v.selector);
    expect(selectors).toContain("#late-chart");
  });
});

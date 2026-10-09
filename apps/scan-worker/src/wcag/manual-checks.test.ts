import { describe, expect, it } from "vitest";
import { findCriterion } from "./find-criterion.js";
import { MANUAL_CHECKS } from "./manual-checks.js";

const checkFor = (criterionId: string) =>
  MANUAL_CHECKS.find((check) => check.criterionId === criterionId);

describe("MANUAL_CHECKS", () => {
  it("covers the 41 criteria of the TechSpec manual check catalog", () => {
    // WHEN
    const ids = new Set(MANUAL_CHECKS.map(({ criterionId }) => criterionId));

    // THEN
    expect([ids.size, MANUAL_CHECKS.length]).toEqual([41, 41]);
  });

  it("references only criteria from the WCAG catalog", () => {
    // WHEN
    const unknown = MANUAL_CHECKS.filter(
      ({ criterionId }) => findCriterion(criterionId) === undefined,
    );

    // THEN
    expect(unknown).toEqual([]);
  });

  it("gives every check plain-language guidance", () => {
    // WHEN
    const missing = MANUAL_CHECKS.filter(
      ({ guidance }) => guidance.trim().length === 0,
    );

    // THEN
    expect(missing).toEqual([]);
  });

  it("probes password and one-time-code fields for 3.3.8", () => {
    // WHEN
    const check = checkFor("3.3.8");

    // THEN
    expect([check?.probeId, check?.scope]).toEqual(["authentication", "page"]);
  });

  it("scopes consistent navigation to the site across multiple pages", () => {
    // WHEN
    const check = checkFor("3.2.3");

    // THEN
    expect([check?.probeId, check?.scope]).toEqual(["multiple-pages", "site"]);
  });

  it("always lists character key shortcuts once per site", () => {
    // WHEN
    const check = checkFor("2.1.4");

    // THEN
    expect([check?.probeId, check?.scope]).toEqual(["always", "site"]);
  });

  it("checks reflow only when the mobile pass overflows horizontally", () => {
    // WHEN
    const check = checkFor("1.4.10");

    // THEN
    expect([check?.probeId, check?.scope]).toEqual([
      "horizontal-overflow",
      "page",
    ]);
  });
});

import { describe, expect, it } from "vitest";
import { homeRuns } from "../testing/axe-fixtures.js";
import { mapViolations } from "./map-violations.js";

describe("mapViolations viewports", () => {
  it("merges the same rule, page, and selector found at both viewports", () => {
    // WHEN
    const violation = mapViolations(homeRuns()).find(
      ({ ruleId }) => ruleId === "image-alt",
    );

    // THEN
    expect(violation?.viewports).toEqual(["desktop", "mobile"]);
  });

  it("keeps a mobile-only finding on the mobile viewport", () => {
    // WHEN
    const violation = mapViolations(homeRuns()).find(
      ({ ruleId }) => ruleId === "target-size",
    );

    // THEN
    expect(violation?.viewports).toEqual(["mobile"]);
  });
});

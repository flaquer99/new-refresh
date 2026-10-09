import { describe, expect, it } from "vitest";
import { findCriterion } from "./find-criterion.js";

describe("findCriterion", () => {
  it("returns the catalog entry for an A/AA criterion id", () => {
    // WHEN
    const criterion = findCriterion("1.1.1");

    // THEN
    expect(criterion).toEqual({
      id: "1.1.1",
      name: "Non-text Content",
      level: "A",
      understandingUrl:
        "https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html",
    });
  });

  it("returns undefined for an AAA criterion", () => {
    // WHEN
    const criterion = findCriterion("1.4.6");

    // THEN
    expect(criterion).toBeUndefined();
  });

  it("returns undefined for the obsolete 4.1.1 criterion", () => {
    // WHEN
    const criterion = findCriterion("4.1.1");

    // THEN
    expect(criterion).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";
import { compareCriterionIds } from "./compare-criterion-ids.js";

describe("compareCriterionIds", () => {
  it("orders ids numerically rather than alphabetically", () => {
    // GIVEN
    const ids = ["1.4.10", "1.4.3", "2.1.1", "1.4.11"];

    // WHEN
    const sorted = [...ids].sort(compareCriterionIds);

    // THEN
    expect(sorted).toEqual(["1.4.3", "1.4.10", "1.4.11", "2.1.1"]);
  });

  it("returns zero for identical ids", () => {
    // WHEN
    const difference = compareCriterionIds("2.4.11", "2.4.11");

    // THEN
    expect(difference).toBe(0);
  });

  it("orders a shorter id before a longer id with the same prefix", () => {
    // WHEN
    const difference = compareCriterionIds("1.4", "1.4.1");

    // THEN
    expect(difference).toBeLessThan(0);
  });

  it("orders a longer id after a shorter id with the same prefix", () => {
    // WHEN
    const difference = compareCriterionIds("1.4.1", "1.4");

    // THEN
    expect(difference).toBeGreaterThan(0);
  });
});

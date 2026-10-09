import { describe, expect, it } from "vitest";
import { criteriaFromTags, parseWcagTag } from "./axe-tags.js";

describe("parseWcagTag", () => {
  it("converts a three-digit tag to a criterion id", () => {
    // WHEN
    const id = parseWcagTag("wcag143");

    // THEN
    expect(id).toBe("1.4.3");
  });

  it("converts a four-digit tag to a two-digit last segment", () => {
    // WHEN
    const id = parseWcagTag("wcag1410");

    // THEN
    expect(id).toBe("1.4.10");
  });

  it("ignores level tags", () => {
    // WHEN
    const id = parseWcagTag("wcag21aa");

    // THEN
    expect(id).toBeNull();
  });

  it("ignores non-WCAG tags", () => {
    // WHEN
    const id = parseWcagTag("best-practice");

    // THEN
    expect(id).toBeNull();
  });
});

describe("criteriaFromTags", () => {
  it("maps wcag tags to catalog criteria sorted by id", () => {
    // GIVEN
    const tags = ["cat.color", "wcag2aa", "wcag1411", "wcag143"];

    // WHEN
    const criteria = criteriaFromTags(tags);

    // THEN
    expect(criteria.map((criterion) => criterion.id)).toEqual([
      "1.4.3",
      "1.4.11",
    ]);
  });

  it("drops criteria outside the A/AA catalog", () => {
    // GIVEN
    const tags = ["wcag2aaa", "wcag146"];

    // WHEN
    const criteria = criteriaFromTags(tags);

    // THEN
    expect(criteria).toEqual([]);
  });

  it("drops the obsolete 4.1.1 criterion", () => {
    // GIVEN
    const tags = ["wcag2a-obsolete", "wcag411", "wcag412"];

    // WHEN
    const criteria = criteriaFromTags(tags);

    // THEN
    expect(criteria).toEqual([]);
  });

  it("drops experimental rules", () => {
    // GIVEN
    const tags = ["experimental", "wcag2a", "wcag131"];

    // WHEN
    const criteria = criteriaFromTags(tags);

    // THEN
    expect(criteria).toEqual([]);
  });

  it("lists a criterion once when its tag repeats", () => {
    // GIVEN
    const tags = ["wcag111", "wcag111"];

    // WHEN
    const criteria = criteriaFromTags(tags);

    // THEN
    expect(criteria.map((criterion) => criterion.id)).toEqual(["1.1.1"]);
  });
});

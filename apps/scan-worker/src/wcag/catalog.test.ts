import { describe, expect, it } from "vitest";
import { WCAG_CRITERIA } from "./catalog.js";

const UNDERSTANDING_URL_PATTERN =
  /^https:\/\/www\.w3\.org\/WAI\/WCAG22\/Understanding\/[a-z0-9-]+\.html$/;

describe("WCAG_CRITERIA", () => {
  it("lists exactly 55 criteria", () => {
    // WHEN
    const count = WCAG_CRITERIA.length;

    // THEN
    expect(count).toBe(55);
  });

  it("lists 31 Level A criteria", () => {
    // WHEN
    const levelA = WCAG_CRITERIA.filter((criterion) => criterion.level === "A");

    // THEN
    expect(levelA).toHaveLength(31);
  });

  it("lists 24 Level AA criteria", () => {
    // WHEN
    const levelAA = WCAG_CRITERIA.filter(
      (criterion) => criterion.level === "AA",
    );

    // THEN
    expect(levelAA).toHaveLength(24);
  });

  it("excludes the obsolete 4.1.1 Parsing criterion", () => {
    // WHEN
    const ids = WCAG_CRITERIA.map((criterion) => criterion.id);

    // THEN
    expect(ids).not.toContain("4.1.1");
  });

  it("has unique criterion ids", () => {
    // WHEN
    const ids = new Set(WCAG_CRITERIA.map((criterion) => criterion.id));

    // THEN
    expect(ids.size).toBe(55);
  });

  it("gives every criterion a W3C Understanding URL", () => {
    // WHEN
    const invalid = WCAG_CRITERIA.filter(
      (criterion) =>
        !UNDERSTANDING_URL_PATTERN.test(criterion.understandingUrl),
    );

    // THEN
    expect(invalid).toEqual([]);
  });

  it("derives the Understanding URL from the criterion name", () => {
    // WHEN
    const contrast = WCAG_CRITERIA.find(
      (criterion) => criterion.id === "1.4.3",
    );

    // THEN
    expect(contrast).toEqual({
      id: "1.4.3",
      name: "Contrast (Minimum)",
      level: "AA",
      understandingUrl:
        "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
    });
  });

  it("builds the official slug for names with punctuation", () => {
    // WHEN
    const errorPrevention = WCAG_CRITERIA.find(
      (criterion) => criterion.id === "3.3.4",
    );

    // THEN
    expect(errorPrevention?.understandingUrl).toBe(
      "https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html",
    );
  });
});

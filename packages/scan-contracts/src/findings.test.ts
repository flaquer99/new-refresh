import { describe, expect, it } from "vitest";
import { CriterionRefSchema, ViolationSchema } from "./findings.js";
import { buildViolation } from "./testing/sample-report.js";

const criterionWithUrl = (understandingUrl: string) => ({
  ...buildViolation().criteria[0],
  understandingUrl,
});

const understandingUrlIssuePath = (understandingUrl: string) =>
  CriterionRefSchema.safeParse(criterionWithUrl(understandingUrl)).error
    ?.issues[0]?.path;

describe("ViolationSchema", () => {
  it("rejects a violation without criteria", () => {
    // GIVEN
    const violation = { ...buildViolation(), criteria: [] };

    // WHEN
    const result = ViolationSchema.safeParse(violation);

    // THEN
    expect(result.error?.issues[0]?.path).toEqual(["criteria"]);
  });

  it("rejects an AAA level", () => {
    // GIVEN
    const violation = { ...buildViolation(), level: "AAA" };

    // WHEN
    const result = ViolationSchema.safeParse(violation);

    // THEN
    expect(result.error?.issues[0]?.path).toEqual(["level"]);
  });
});

describe("CriterionRefSchema understandingUrl", () => {
  it("accepts a W3C WCAG 2.2 Understanding document", () => {
    // GIVEN
    const url =
      "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html";

    // WHEN
    const result = CriterionRefSchema.safeParse(criterionWithUrl(url));

    // THEN
    expect(result.data?.understandingUrl).toBe(url);
  });

  it("rejects a javascript: URL", () => {
    // GIVEN / WHEN
    const path = understandingUrlIssuePath("javascript:alert(1)");

    // THEN
    expect(path).toEqual(["understandingUrl"]);
  });

  it("rejects an http URL to the Understanding documents", () => {
    // GIVEN / WHEN
    const path = understandingUrlIssuePath(
      "http://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
    );

    // THEN
    expect(path).toEqual(["understandingUrl"]);
  });

  it("rejects an https URL on another host", () => {
    // GIVEN / WHEN
    const path = understandingUrlIssuePath(
      "https://evil.example/WAI/WCAG22/Understanding/contrast-minimum.html",
    );

    // THEN
    expect(path).toEqual(["understandingUrl"]);
  });

  it("rejects a w3.org URL outside the Understanding documents", () => {
    // GIVEN / WHEN
    const path = understandingUrlIssuePath("https://www.w3.org/WAI/");

    // THEN
    expect(path).toEqual(["understandingUrl"]);
  });

  it("rejects a prefix match on a lookalike host", () => {
    // GIVEN / WHEN
    const path = understandingUrlIssuePath(
      "https://www.w3.org.evil.example/WAI/WCAG22/Understanding/x.html",
    );

    // THEN
    expect(path).toEqual(["understandingUrl"]);
  });
});

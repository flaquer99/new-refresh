import { describe, expect, it } from "vitest";
import {
  buildNode,
  buildRule,
  homeRuns,
  singleRuleRun,
} from "../testing/axe-fixtures.js";
import { mapViolations } from "./map-violations.js";

const findRule = (ruleId: string) =>
  mapViolations(homeRuns()).find((violation) => violation.ruleId === ruleId);

describe("mapViolations criteria", () => {
  it("maps image-alt to 1.1.1 Non-text Content at Level A", () => {
    // WHEN
    const violation = findRule("image-alt");

    // THEN
    expect(violation?.criteria).toEqual([
      {
        id: "1.1.1",
        name: "Non-text Content",
        level: "A",
        understandingUrl:
          "https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html",
      },
    ]);
  });

  it("maps color-contrast to 1.4.3 at Level AA", () => {
    // WHEN
    const violation = findRule("color-contrast");

    // THEN
    expect(violation?.criteria.map(({ id, level }) => ({ id, level }))).toEqual(
      [{ id: "1.4.3", level: "AA" }],
    );
  });

  it("maps a wcag1410 tag to 1.4.10 Reflow", () => {
    // GIVEN
    const rule = buildRule({
      id: "reflow-rule",
      tags: ["wcag21aa", "wcag1410"],
    });

    // WHEN
    const [violation] = mapViolations([singleRuleRun({ rule })]);

    // THEN
    expect(violation?.criteria.map(({ id, name }) => ({ id, name }))).toEqual([
      { id: "1.4.10", name: "Reflow" },
    ]);
  });

  it("uses Level A when the criteria mix A and AA", () => {
    // GIVEN
    const rule = buildRule({ tags: ["wcag143", "wcag111"] });

    // WHEN
    const [violation] = mapViolations([singleRuleRun({ rule })]);

    // THEN
    expect(violation?.level).toBe("A");
  });

  it("drops findings with no A/AA criterion", () => {
    // WHEN
    const ruleIds = mapViolations(homeRuns()).map(({ ruleId }) => ruleId);

    // THEN
    expect(ruleIds).toEqual(["image-alt", "color-contrast", "target-size"]);
  });

  it("emits one violation per failing node", () => {
    // GIVEN
    const nodes = [
      buildNode({ target: ["#first"] }),
      buildNode({ target: ["#second"] }),
    ];

    // WHEN
    const violations = mapViolations([
      singleRuleRun({ rule: buildRule({ nodes }) }),
    ]);

    // THEN
    expect(violations.map(({ selector }) => selector)).toEqual([
      "#first",
      "#second",
    ]);
  });
});

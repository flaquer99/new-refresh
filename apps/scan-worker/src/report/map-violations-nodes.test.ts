import { describe, expect, it } from "vitest";
import {
  buildNode,
  buildRule,
  homeRuns,
  singleRuleRun,
} from "../testing/axe-fixtures.js";
import { mapViolations } from "./map-violations.js";
import { HTML_SNIPPET_MAX } from "./node-finding.js";

const mapSingleNode = (node: ReturnType<typeof buildNode>) => {
  const rule = buildRule({ nodes: [node] });
  return mapViolations([singleRuleRun({ rule })])[0];
};

describe("mapViolations node fields", () => {
  it("maps the node impact to the severity", () => {
    // WHEN
    const violation = mapSingleNode(buildNode({ impact: "minor" }));

    // THEN
    expect(violation?.severity).toBe("minor");
  });

  it("maps a null impact to moderate", () => {
    // WHEN
    const violation = mapSingleNode(buildNode({ impact: null }));

    // THEN
    expect(violation?.severity).toBe("moderate");
  });

  it("sorts violations by severity, then criterion id", () => {
    // WHEN
    const order = mapViolations(homeRuns()).map(({ severity, criteria }) => [
      severity,
      criteria[0]?.id,
    ]);

    // THEN
    expect(order).toEqual([
      ["critical", "1.1.1"],
      ["serious", "1.4.3"],
      ["serious", "2.5.8"],
    ]);
  });

  it("joins shadow DOM and iframe targets with >>>", () => {
    // WHEN
    const violation = mapSingleNode(
      buildNode({ target: ["iframe#pay", ["my-widget", "button.buy"]] }),
    );

    // THEN
    expect(violation?.selector).toBe("iframe#pay >>> my-widget >>> button.buy");
  });

  it("truncates the html snippet to the maximum length", () => {
    // WHEN
    const violation = mapSingleNode(buildNode({ html: "x".repeat(800) }));

    // THEN
    expect(violation?.html).toHaveLength(HTML_SNIPPET_MAX);
  });

  it("uses the rule help as description and the failure summary as fix", () => {
    // WHEN
    const violation = mapSingleNode(buildNode());

    // THEN
    expect([violation?.description, violation?.fixGuidance]).toEqual([
      "Buttons must have discernible text",
      "Fix any of the following:\n  Element has no name",
    ]);
  });

  it("gives the same rule, page, and selector the same id", () => {
    // WHEN
    const first = mapSingleNode(buildNode());
    const second = mapSingleNode(buildNode({ html: "<button>x</button>" }));

    // THEN
    expect(first?.id).toBe(second?.id);
  });

  it("gives different selectors different ids", () => {
    // WHEN
    const first = mapSingleNode(buildNode({ target: ["#a"] }));
    const second = mapSingleNode(buildNode({ target: ["#b"] }));

    // THEN
    expect(first?.id).not.toBe(second?.id);
  });
});

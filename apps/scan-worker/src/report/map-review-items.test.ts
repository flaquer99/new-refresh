import { describe, expect, it } from "vitest";
import {
  buildNode,
  buildRule,
  HOME_URL,
  homeRuns,
  singleRuleRun,
} from "../testing/axe-fixtures.js";
import { mapReviewItems } from "./map-review-items.js";

describe("mapReviewItems", () => {
  it("turns an axe incomplete result into a review item", () => {
    // WHEN
    const [item] = mapReviewItems(homeRuns());

    // THEN
    expect(item).toEqual({
      id: expect.stringMatching(/^[0-9a-f]{16}$/),
      ruleId: "color-contrast",
      criteria: [
        {
          id: "1.4.3",
          name: "Contrast (Minimum)",
          level: "AA",
          understandingUrl:
            "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
        },
      ],
      pageUrl: HOME_URL,
      selector: "header h1",
      html: "<h1>Example</h1>",
      viewports: ["desktop", "mobile"],
      guidance:
        "Fix any of the following:\n  Element's background color could not be determined due to a background image",
    });
  });

  it("drops incomplete results with no A/AA criterion", () => {
    // WHEN
    const ruleIds = mapReviewItems(homeRuns()).map(({ ruleId }) => ruleId);

    // THEN
    expect(ruleIds).toEqual(["color-contrast"]);
  });

  it("ignores confirmed violations", () => {
    // GIVEN
    const run = singleRuleRun({ rule: buildRule(), kind: "violations" });

    // WHEN
    const items = mapReviewItems([run]);

    // THEN
    expect(items).toEqual([]);
  });

  it("falls back to the rule help when the failure summary is empty", () => {
    // GIVEN
    const rule = buildRule({ nodes: [buildNode({ failureSummary: "  " })] });

    // WHEN
    const [item] = mapReviewItems([
      singleRuleRun({ rule, kind: "incomplete" }),
    ]);

    // THEN
    expect(item?.guidance).toBe("Buttons must have discernible text");
  });

  it("falls back to the rule help when the failure summary is missing", () => {
    // GIVEN
    const node = { target: ["#x"], html: "<div id=x></div>" };
    const rule = buildRule({ nodes: [node] });

    // WHEN
    const [item] = mapReviewItems([
      singleRuleRun({ rule, kind: "incomplete" }),
    ]);

    // THEN
    expect(item?.guidance).toBe("Buttons must have discernible text");
  });
});

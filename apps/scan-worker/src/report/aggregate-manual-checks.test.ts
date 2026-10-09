import { describe, expect, it } from "vitest";
import { aggregateManualChecks } from "./aggregate-manual-checks.js";

const HOME = "https://fixtures.test/";
const LOGIN = "https://fixtures.test/login";

const findCheck = (
  checks: ReturnType<typeof aggregateManualChecks>,
  criterionId: string,
) => checks.find(({ criterion }) => criterion.id === criterionId);

describe("aggregateManualChecks", () => {
  it("lists a page check on the pages where its probe matched", () => {
    // GIVEN
    const pages = [
      { pageUrl: HOME, probeIds: [] },
      { pageUrl: LOGIN, probeIds: ["authentication" as const] },
    ];

    // WHEN
    const check = findCheck(aggregateManualChecks(pages), "3.3.8");

    // THEN
    expect(check).toEqual({
      criterion: {
        id: "3.3.8",
        name: "Accessible Authentication (Minimum)",
        level: "AA",
        understandingUrl:
          "https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html",
      },
      scope: "page",
      pages: [LOGIN],
      guidance: expect.stringContaining("cognitive function test"),
    });
  });

  it("omits a page check whose probe matched no page", () => {
    // WHEN
    const checks = aggregateManualChecks([{ pageUrl: HOME, probeIds: [] }]);

    // THEN
    expect(findCheck(checks, "1.2.2")).toBeUndefined();
  });

  it("lists always-applicable page checks on every scanned page", () => {
    // GIVEN
    const pages = [
      { pageUrl: HOME, probeIds: [] },
      { pageUrl: LOGIN, probeIds: [] },
    ];

    // WHEN
    const check = findCheck(aggregateManualChecks(pages), "2.1.1");

    // THEN
    expect(check?.pages).toEqual([HOME, LOGIN]);
  });

  it("emits nothing when no page was scanned", () => {
    // WHEN
    const checks = aggregateManualChecks([]);

    // THEN
    expect(checks).toEqual([]);
  });

  it("sorts checks by criterion id", () => {
    // GIVEN
    const pages = [
      { pageUrl: HOME, probeIds: ["horizontal-overflow" as const] },
    ];

    // WHEN
    const ids = aggregateManualChecks(pages).map(
      ({ criterion }) => criterion.id,
    );

    // THEN
    expect(ids.slice(0, 5)).toEqual([
      "1.3.2",
      "1.3.3",
      "1.4.1",
      "1.4.10",
      "1.4.11",
    ]);
  });
});

import { describe, expect, it } from "vitest";
import { aggregateManualChecks } from "./aggregate-manual-checks.js";

const HOME = "https://fixtures.test/";
const LOGIN = "https://fixtures.test/login";

const findCheck = (
  checks: ReturnType<typeof aggregateManualChecks>,
  criterionId: string,
) => checks.find(({ criterion }) => criterion.id === criterionId);

describe("aggregateManualChecks site scope", () => {
  it("omits multi-page site checks when only one page was scanned", () => {
    // WHEN
    const checks = aggregateManualChecks([{ pageUrl: HOME, probeIds: [] }]);

    // THEN
    expect(findCheck(checks, "3.2.3")).toBeUndefined();
  });

  it("emits a multi-page site check once when two pages were scanned", () => {
    // GIVEN
    const pages = [
      { pageUrl: HOME, probeIds: [] },
      { pageUrl: LOGIN, probeIds: [] },
    ];

    // WHEN
    const checks = aggregateManualChecks(pages).filter(
      ({ criterion }) => criterion.id === "3.2.3",
    );

    // THEN
    expect(checks.map(({ scope, pages: urls }) => ({ scope, urls }))).toEqual([
      { scope: "site", urls: [HOME, LOGIN] },
    ]);
  });

  it("emits always-applicable site checks for a single page", () => {
    // WHEN
    const checks = aggregateManualChecks([{ pageUrl: HOME, probeIds: [] }]);

    // THEN
    expect(findCheck(checks, "2.1.4")?.scope).toBe("site");
  });
});

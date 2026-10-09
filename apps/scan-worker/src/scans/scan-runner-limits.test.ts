import { MAX_PAGES } from "@refresh/scan-contracts/limits";
import { describe, expect, it } from "vitest";
import { runStubScan } from "../testing/run-stub-scan.js";

const START = "https://a.test/";
const LINKED_PAGES = 59;

const largeSite = () => {
  const links = Array.from(
    { length: LINKED_PAGES },
    (_, index) => `${START}page-${index + 1}`,
  );
  return Object.fromEntries([
    [START, { links }],
    ...links.map((link) => [link, {}]),
  ]);
};

const scanLargeSite = () =>
  runStubScan({ request: { url: START, depth: 1 }, site: largeSite() });

describe("ScanRunner page cap", () => {
  it("ends with page-limit-reached when the cap leaves URLs queued", async () => {
    // WHEN
    const report = await scanLargeSite();

    // THEN
    expect(report.outcome).toBe("page-limit-reached");
  });

  it("attempts exactly 50 pages", async () => {
    // WHEN
    const report = await scanLargeSite();

    // THEN
    expect(report.summary.pagesScanned).toBe(MAX_PAGES);
  });

  it("records the URLs left in the queue as not-reached", async () => {
    // WHEN
    const report = await scanLargeSite();

    // THEN
    const leftovers = report.pages.filter((p) => p.reason === "not-reached");
    expect(leftovers.map(({ url }) => url)).toEqual(
      Array.from({ length: 10 }, (_, index) => `${START}page-${index + 50}`),
    );
  });

  it("ends with complete when the queue empties", async () => {
    // WHEN
    const report = await runStubScan({
      request: { url: START, depth: 1 },
      site: { [START]: {} },
    });

    // THEN
    expect(report.outcome).toBe("complete");
  });
});

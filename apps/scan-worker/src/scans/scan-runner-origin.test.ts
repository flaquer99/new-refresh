import { describe, expect, it } from "vitest";
import { runStubScan } from "../testing/run-stub-scan.js";

const START = "https://a.test/";
const WWW = "https://www.a.test/";

const urlsOf = (pages: { url: string }[]) => pages.map(({ url }) => url);

describe("ScanRunner origin and robots", () => {
  it("records robots-disallowed links as skipped without auditing them", async () => {
    // GIVEN
    const site = { [START]: { links: [`${START}private/x`] } };

    // WHEN
    const report = await runStubScan({
      request: { url: START, depth: 1 },
      site,
      robotsTxt: "User-agent: *\nDisallow: /private",
    });

    // THEN
    expect(report.pages[1]).toEqual({
      url: `${START}private/x`,
      depth: 1,
      status: "skipped",
      reason: "robots-disallowed",
      httpStatus: null,
    });
  });

  it("does not attempt links to another origin", async () => {
    // GIVEN
    const site = { [START]: { links: ["https://b.test/", `${START}local`] } };

    // WHEN
    const report = await runStubScan({
      request: { url: START, depth: 1 },
      site,
    });

    // THEN
    expect(urlsOf(report.pages)).toEqual([START, `${START}local`]);
  });

  it("uses the start page's origin after redirects for the crawl", async () => {
    // GIVEN
    const site = {
      [START]: { finalUrl: WWW, links: [`${WWW}about`, `${START}old`] },
    };

    // WHEN
    const report = await runStubScan({
      request: { url: START, depth: 1 },
      site,
    });

    // THEN
    expect(urlsOf(report.pages)).toEqual([WWW, `${WWW}about`]);
  });

  it("reports the start page's origin after redirects", async () => {
    // GIVEN
    const site = { [START]: { finalUrl: WWW } };

    // WHEN
    const report = await runStubScan({
      request: { url: START, depth: 0 },
      site,
    });

    // THEN
    expect(report.origin).toBe("https://www.a.test");
  });
});

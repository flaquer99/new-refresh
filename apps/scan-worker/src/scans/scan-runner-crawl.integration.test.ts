import { describe, expect, it } from "vitest";
import { useRunner } from "../testing/use-runner.js";

const pathsOf = (pages: { url: string }[], origin: string) =>
  pages.map(({ url }) => url.replace(origin, ""));

describe("ScanRunner crawl on fixture sites", () => {
  const runner = useRunner();

  it("scans only the start URL at depth 0", async () => {
    // WHEN
    const report = await runner.scan("/crawl/", 0);

    // THEN
    expect(report.pages).toEqual([
      {
        url: `${runner.origin()}/crawl/`,
        depth: 0,
        status: "scanned",
        reason: null,
        httpStatus: null,
      },
    ]);
  });

  it("follows the crawl graph one hop at depth 1", async () => {
    // WHEN
    const report = await runner.scan("/crawl/", 1);

    // THEN
    expect(pathsOf(report.pages, runner.origin())).toEqual([
      "/crawl/",
      "/crawl/b.html",
      "/crawl/c.html",
    ]);
  });

  it("adds the second-hop page at depth 2", async () => {
    // WHEN
    const report = await runner.scan("/crawl/", 2);

    // THEN
    expect(pathsOf(report.pages, runner.origin())).toEqual([
      "/crawl/",
      "/crawl/b.html",
      "/crawl/c.html",
      "/crawl/d.html",
    ]);
  });

  it("does not attempt a link to another origin", async () => {
    // WHEN
    const report = await runner.scan("/cross-origin/", 1);

    // THEN
    expect(pathsOf(report.pages, runner.origin())).toEqual([
      "/cross-origin/",
      "/cross-origin/local.html",
    ]);
  });

  it("scans fragment variants of a page once", async () => {
    // WHEN
    const report = await runner.scan("/fragments/", 1);

    // THEN
    expect(pathsOf(report.pages, runner.origin())).toEqual([
      "/fragments/",
      "/fragments/p.html",
    ]);
  });
});

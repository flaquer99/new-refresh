import { describe, expect, it } from "vitest";
import { createCrawlFrontier, MAX_DISCOVERED_URLS } from "./crawl-frontier.js";

const START = "https://a.test/";
const START_DEPTH = 0;

const linksTo = (count: number, prefix = "page") =>
  Array.from({ length: count }, (_, index) => `${START}${prefix}-${index}`);

const frontierAt = () => createCrawlFrontier({ startUrl: START, maxDepth: 2 });

describe("CrawlFrontier discovery cap", () => {
  it("keeps 500 discovered URLs in total, counting the start URL", () => {
    // GIVEN
    const frontier = frontierAt();

    // WHEN
    const found = frontier.discover(linksTo(1000), START_DEPTH);

    // THEN
    expect([MAX_DISCOVERED_URLS, found.length]).toEqual([500, 499]);
  });

  it("discovers nothing more once the cap is reached", () => {
    // GIVEN
    const frontier = frontierAt();
    frontier.discover(linksTo(MAX_DISCOVERED_URLS), START_DEPTH);

    // WHEN
    const found = frontier.discover(linksTo(10, "late"), START_DEPTH);

    // THEN
    expect(found).toEqual([]);
  });

  it("keeps the queue and leftovers within the cap", () => {
    // GIVEN
    const frontier = frontierAt();

    // WHEN
    frontier.enqueue(frontier.discover(linksTo(1000), START_DEPTH));

    // THEN
    expect(frontier.discoveredCount()).toBe(MAX_DISCOVERED_URLS);
  });
});

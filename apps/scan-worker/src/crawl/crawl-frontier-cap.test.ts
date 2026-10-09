import { MAX_PAGES } from "@refresh/scan-contracts/limits";
import { describe, expect, it } from "vitest";
import { drainFrontier } from "../testing/drain-frontier.js";
import { createCrawlFrontier } from "./crawl-frontier.js";

const START = "https://a.test/";
const LINKED_PAGES = 59;

const largeSite = () => {
  const pages = Array.from(
    { length: LINKED_PAGES },
    (_, index) => `${START}page-${index + 1}`,
  );
  return { [START]: pages };
};

const crawledLargeSite = () => {
  const frontier = createCrawlFrontier({ startUrl: START, maxDepth: 1 });
  const visited = drainFrontier(frontier, largeSite());
  return { frontier, visited };
};

describe("CrawlFrontier page cap", () => {
  it("hands out at most 50 entries", () => {
    // WHEN
    const { visited } = crawledLargeSite();

    // THEN
    expect(visited).toHaveLength(MAX_PAGES);
  });

  it("returns nothing on the 51st dequeue", () => {
    // GIVEN
    const { frontier } = crawledLargeSite();

    // WHEN
    const entry = frontier.next();

    // THEN
    expect(entry).toBeNull();
  });

  it("reports the cap when URLs are left in the queue", () => {
    // WHEN
    const { frontier } = crawledLargeSite();

    // THEN
    expect(frontier.limitReached()).toBe(true);
  });

  it("returns the URLs left in the queue as leftovers", () => {
    // WHEN
    const { frontier } = crawledLargeSite();

    // THEN
    expect(frontier.leftovers()).toEqual([
      { url: `${START}page-50`, depth: 1 },
      { url: `${START}page-51`, depth: 1 },
      { url: `${START}page-52`, depth: 1 },
      { url: `${START}page-53`, depth: 1 },
      { url: `${START}page-54`, depth: 1 },
      { url: `${START}page-55`, depth: 1 },
      { url: `${START}page-56`, depth: 1 },
      { url: `${START}page-57`, depth: 1 },
      { url: `${START}page-58`, depth: 1 },
      { url: `${START}page-59`, depth: 1 },
    ]);
  });

  it("counts every queued URL as discovered, attempted or not", () => {
    // WHEN
    const { frontier } = crawledLargeSite();

    // THEN
    expect(frontier.discoveredCount()).toBe(LINKED_PAGES + 1);
  });

  it("does not report the cap when the queue empties first", () => {
    // GIVEN
    const frontier = createCrawlFrontier({ startUrl: START, maxDepth: 0 });

    // WHEN
    drainFrontier(frontier, largeSite());

    // THEN
    expect(frontier.limitReached()).toBe(false);
  });
});

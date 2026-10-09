import { describe, expect, it } from "vitest";
import { drainFrontier } from "../testing/drain-frontier.js";
import { createCrawlFrontier } from "./crawl-frontier.js";

const START = "https://a.test/";
const B = "https://a.test/b";
const C = "https://a.test/c";
const D = "https://a.test/d";

const GRAPH = { [START]: [B, C], [B]: [D] };

describe("CrawlFrontier depth limit", () => {
  it("yields the start URL and its direct links at depth 1", () => {
    // GIVEN
    const frontier = createCrawlFrontier({ startUrl: START, maxDepth: 1 });

    // WHEN
    const visited = drainFrontier(frontier, GRAPH);

    // THEN
    expect(visited).toEqual([START, B, C]);
  });

  it("adds the second-hop page at depth 2", () => {
    // GIVEN
    const frontier = createCrawlFrontier({ startUrl: START, maxDepth: 2 });

    // WHEN
    const visited = drainFrontier(frontier, GRAPH);

    // THEN
    expect(visited).toEqual([START, B, C, D]);
  });

  it("yields only the start URL at depth 0", () => {
    // GIVEN
    const frontier = createCrawlFrontier({ startUrl: START, maxDepth: 0 });

    // WHEN
    const visited = drainFrontier(frontier, GRAPH);

    // THEN
    expect(visited).toEqual([START]);
  });

  it("records the hop count of each discovered entry", () => {
    // GIVEN
    const frontier = createCrawlFrontier({ startUrl: START, maxDepth: 2 });
    frontier.next();

    // WHEN
    const fresh = frontier.discover([B], 0);

    // THEN
    expect(fresh).toEqual([{ url: B, depth: 1 }]);
  });
});

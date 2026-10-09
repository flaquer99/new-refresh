import { describe, expect, it } from "vitest";
import { drainFrontier } from "../testing/drain-frontier.js";
import { createCrawlFrontier } from "./crawl-frontier.js";

const START = "https://a.test/";
const PAGE = "https://a.test/p";

describe("CrawlFrontier dedupe", () => {
  it("dequeues a URL enqueued three times only once", () => {
    // GIVEN
    const frontier = createCrawlFrontier({ startUrl: START, maxDepth: 1 });
    const graph = { [START]: [PAGE, PAGE, PAGE] };

    // WHEN
    const visited = drainFrontier(frontier, graph);

    // THEN
    expect(visited).toEqual([START, PAGE]);
  });

  it("treats fragment variants of a page as the same URL", () => {
    // GIVEN
    const frontier = createCrawlFrontier({ startUrl: START, maxDepth: 1 });
    const graph = { [START]: [`${PAGE}#1`, `${PAGE}#2`, PAGE] };

    // WHEN
    const visited = drainFrontier(frontier, graph);

    // THEN
    expect(visited).toEqual([START, PAGE]);
  });

  it("never rediscovers the start URL", () => {
    // GIVEN
    const frontier = createCrawlFrontier({ startUrl: START, maxDepth: 2 });
    const graph = { [START]: [PAGE], [PAGE]: [`${START}#top`] };

    // WHEN
    const visited = drainFrontier(frontier, graph);

    // THEN
    expect(visited).toEqual([START, PAGE]);
  });

  it("does not rediscover a URL marked as seen", () => {
    // GIVEN
    const frontier = createCrawlFrontier({ startUrl: START, maxDepth: 1 });
    frontier.next();
    frontier.markSeen(`${PAGE}#landing`);

    // WHEN
    const fresh = frontier.discover([PAGE], 0);

    // THEN
    expect(fresh).toEqual([]);
  });
});

import type { CrawlFrontier } from "../crawl/crawl-frontier.js";

export type LinkGraph = Readonly<Record<string, readonly string[]>>;

export const drainFrontier = (
  frontier: CrawlFrontier,
  graph: LinkGraph,
): string[] => {
  const visited: string[] = [];
  for (let entry = frontier.next(); entry; entry = frontier.next()) {
    visited.push(entry.url);
    frontier.enqueue(frontier.discover(graph[entry.url] ?? [], entry.depth));
  }
  return visited;
};

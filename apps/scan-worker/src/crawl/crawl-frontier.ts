import { MAX_PAGES } from "@refresh/scan-contracts/limits";
import { normalizeUrl } from "./normalize-url.js";

const START_DEPTH = 0;
const DISCOVERY_FACTOR = 10;
export const MAX_DISCOVERED_URLS = MAX_PAGES * DISCOVERY_FACTOR;

export type FrontierEntry = { url: string; depth: number };

export type CrawlFrontierOptions = { startUrl: string; maxDepth: number };

export type CrawlFrontier = {
  next: () => FrontierEntry | null;
  discover: (links: readonly string[], fromDepth: number) => FrontierEntry[];
  enqueue: (entries: readonly FrontierEntry[]) => void;
  markSeen: (url: string) => void;
  limitReached: () => boolean;
  leftovers: () => FrontierEntry[];
  discoveredCount: () => number;
};

const unseenUrls = (links: readonly string[], seen: Set<string>): string[] => {
  const fresh: string[] = [];
  for (const link of links) {
    if (seen.size >= MAX_DISCOVERED_URLS) {
      break;
    }
    const url = normalizeUrl(link);
    if (!seen.has(url)) {
      seen.add(url);
      fresh.push(url);
    }
  }
  return fresh;
};

type FrontierState = {
  queue: FrontierEntry[];
  seen: Set<string>;
  maxDepth: number;
  attempts: number;
  discovered: number;
};

const initialState = ({
  startUrl,
  maxDepth,
}: CrawlFrontierOptions): FrontierState => {
  const start = { url: normalizeUrl(startUrl), depth: START_DEPTH };
  const seen = new Set([start.url]);
  return { queue: [start], seen, maxDepth, attempts: 0, discovered: 1 };
};

const isCapped = (state: FrontierState): boolean => state.attempts >= MAX_PAGES;

const dequeue = (state: FrontierState): FrontierEntry | null => {
  const entry = isCapped(state) ? undefined : state.queue.shift();
  state.attempts += entry ? 1 : 0;
  return entry ?? null;
};

const discoverLinks = (
  state: FrontierState,
  links: readonly string[],
  fromDepth: number,
): FrontierEntry[] => {
  const depth = fromDepth + 1;
  if (depth > state.maxDepth) {
    return [];
  }
  return unseenUrls(links, state.seen).map((url) => ({ url, depth }));
};

export const createCrawlFrontier = (
  options: CrawlFrontierOptions,
): CrawlFrontier => {
  const state = initialState(options);
  return {
    next: () => dequeue(state),
    discover: (links, fromDepth) => discoverLinks(state, links, fromDepth),
    enqueue: (entries) => {
      state.queue.push(...entries);
      state.discovered += entries.length;
    },
    markSeen: (url) => {
      state.seen.add(normalizeUrl(url));
    },
    limitReached: () => isCapped(state) && state.queue.length > 0,
    leftovers: () => [...state.queue],
    discoveredCount: () => state.discovered,
  };
};

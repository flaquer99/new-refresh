import type { PageResult } from "@refresh/scan-contracts/page-result";
import type { FrontierEntry } from "../crawl/crawl-frontier.js";
import { isSameOrigin } from "../crawl/normalize-url.js";
import { START_DEPTH } from "./crawl-context.js";

export type ScanScope = { origin: string; pages: readonly PageResult[] };

const isAlreadyScanned = (pages: readonly PageResult[], url: string) =>
  pages.some((page) => page.url === url && page.status === "scanned");

export const landsInScope = (
  { origin, pages }: ScanScope,
  entry: FrontierEntry,
  finalUrl: string,
): boolean => {
  if (entry.depth === START_DEPTH) {
    return true;
  }
  return isSameOrigin(finalUrl, origin) && !isAlreadyScanned(pages, finalUrl);
};

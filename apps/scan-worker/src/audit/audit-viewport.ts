import type { Viewport } from "@refresh/scan-contracts/findings";
import type { BrowserContext, Page } from "playwright";
import { extractLinks } from "../crawl/extract-links.js";
import type { AxeResults } from "../report/axe-results.js";
import type { PageProbeId } from "../wcag/manual-probe-ids.js";
import { runAxe } from "./axe-runner.js";
import type { LoadRejection } from "./classify-response.js";
import { type LoadTimeouts, loadPage } from "./load-page.js";
import { runManualProbes } from "./manual-probes.js";

export type ViewportPass = {
  context: BrowserContext;
  viewport: Viewport;
  url: string;
  timeouts: LoadTimeouts;
  collectLinks: boolean;
};

export type ViewportAudit = {
  kind: "audited";
  viewport: Viewport;
  finalUrl: string;
  results: AxeResults;
  probeIds: PageProbeId[];
  links: string[];
};

const closePopupsOf = (page: Page) => {
  const closing: Promise<void>[] = [];
  page.on("popup", (popup) => {
    closing.push(popup.close());
  });
  return async (context: BrowserContext) => {
    const strays = context.pages().map((stray) => stray.close());
    await Promise.allSettled([...closing, ...strays]);
  };
};

export const auditViewport = async ({
  context,
  viewport,
  url,
  timeouts,
  collectLinks,
}: ViewportPass): Promise<ViewportAudit | LoadRejection> => {
  const page = await context.newPage();
  const closePopups = closePopupsOf(page);
  try {
    const loaded = await loadPage(page, url, timeouts);
    if (loaded.kind !== "loaded") {
      return loaded;
    }
    const results = await runAxe(page);
    const probeIds = await runManualProbes(page, viewport);
    const links = collectLinks ? await extractLinks(page) : [];
    const { finalUrl } = loaded;
    return { kind: "audited", viewport, finalUrl, results, probeIds, links };
  } finally {
    await page.close();
    await closePopups(context);
  }
};

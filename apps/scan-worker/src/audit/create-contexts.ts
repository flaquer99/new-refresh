import type { Viewport } from "@refresh/scan-contracts/findings";
import type { Browser, BrowserContext } from "playwright";
import { USER_AGENT_SUFFIX, VIEWPORT_SIZES } from "./viewports.js";

export type ViewportContexts = Record<Viewport, BrowserContext> & {
  close: () => Promise<void>;
};

const defaultUserAgent = async (browser: Browser): Promise<string> => {
  const page = await browser.newPage();
  try {
    return await page.evaluate(() => navigator.userAgent);
  } finally {
    await page.close();
  }
};

const newViewportContext = (
  browser: Browser,
  viewport: Viewport,
  userAgent: string,
): Promise<BrowserContext> =>
  browser.newContext({
    viewport: VIEWPORT_SIZES[viewport],
    userAgent,
    serviceWorkers: "block",
    acceptDownloads: false,
  });

export const createViewportContexts = async (
  browser: Browser,
): Promise<ViewportContexts> => {
  const userAgent = `${await defaultUserAgent(browser)} ${USER_AGENT_SUFFIX}`;
  const desktop = await newViewportContext(browser, "desktop", userAgent);
  const mobile = await newViewportContext(browser, "mobile", userAgent);
  return {
    desktop,
    mobile,
    close: async () => {
      await Promise.all([desktop.close(), mobile.close()]);
    },
  };
};

import type { Page } from "playwright";

const LINK_SELECTOR = "a[href], area[href]";
const WEB_PROTOCOLS = new Set(["http:", "https:"]);

const isWebUrl = (href: string): boolean =>
  URL.canParse(href) && WEB_PROTOCOLS.has(new URL(href).protocol);

export const extractLinks = async (page: Page): Promise<string[]> => {
  const hrefs = await page
    .locator(LINK_SELECTOR)
    .evaluateAll((elements) =>
      elements.map((element) =>
        element instanceof HTMLAnchorElement ||
        element instanceof HTMLAreaElement
          ? element.href
          : "",
      ),
    );
  return [...new Set(hrefs.filter(isWebUrl))];
};

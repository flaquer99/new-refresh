import type { Page, Request, Response } from "playwright";

export type MainResponseTracker = () => Response | null;
export type NavigationUrlTracker = () => string | null;

const isMainNavigation = (page: Page, request: Request): boolean =>
  request.isNavigationRequest() && request.frame() === page.mainFrame();

export const trackMainResponse = (page: Page): MainResponseTracker => {
  let latest: Response | null = null;
  page.on("response", (response) => {
    if (isMainNavigation(page, response.request())) {
      latest = response;
    }
  });
  return () => latest;
};

export const trackNavigationUrl = (page: Page): NavigationUrlTracker => {
  let latest: string | null = null;
  page.on("request", (request) => {
    if (isMainNavigation(page, request)) {
      latest = request.url();
    }
  });
  return () => latest;
};

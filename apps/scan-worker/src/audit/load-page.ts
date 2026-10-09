import { errors, type Page, type Response } from "playwright";
import { EGRESS_VERDICT_HEADER } from "../network/egress-policy.js";
import {
  classifyNavigationError,
  isTunnelRefusal,
} from "./classify-navigation-error.js";
import {
  classifyResponse,
  failed,
  type LoadRejection,
} from "./classify-response.js";
import {
  type MainResponseTracker,
  type NavigationUrlTracker,
  trackMainResponse,
  trackNavigationUrl,
} from "./main-response.js";

export const PAGE_LOAD_TIMEOUT_MS = 30_000;
export const SETTLE_TIMEOUT_MS = 5000;

export type LoadTimeouts = { loadMs: number; settleMs: number };

export const DEFAULT_LOAD_TIMEOUTS: LoadTimeouts = {
  loadMs: PAGE_LOAD_TIMEOUT_MS,
  settleMs: SETTLE_TIMEOUT_MS,
};

export type LoadedPage = { kind: "loaded"; finalUrl: string };

const classifyMainResponse = (response: Response | null) => {
  if (!response) {
    return failed("network-error");
  }
  const headers = response.headers();
  return classifyResponse({
    status: response.status(),
    contentType: headers["content-type"] ?? null,
    egressVerdict: headers[EGRESS_VERDICT_HEADER] ?? null,
  });
};

type NavigationTrackers = {
  mainResponse: MainResponseTracker;
  navigationUrl: NavigationUrlTracker;
};

const rejectNavigation = (
  error: unknown,
  url: string,
  { mainResponse, navigationUrl }: NavigationTrackers,
): LoadRejection => {
  const rejection = classifyNavigationError(error);
  if (rejection.kind === "failed" && isTunnelRefusal(error)) {
    return { ...rejection, refusedUrl: navigationUrl() ?? url };
  }
  if (rejection.kind !== "skipped") {
    return rejection;
  }
  return { ...rejection, httpStatus: mainResponse()?.status() ?? null };
};

const navigate = async (page: Page, url: string, timeoutMs: number) => {
  const trackers = {
    mainResponse: trackMainResponse(page),
    navigationUrl: trackNavigationUrl(page),
  };
  try {
    const response = await page.goto(url, {
      waitUntil: "load",
      timeout: timeoutMs,
    });
    return classifyMainResponse(response);
  } catch (error) {
    return rejectNavigation(error, url, trackers);
  }
};

const settle = async (page: Page, timeoutMs: number): Promise<void> => {
  try {
    await page.waitForLoadState("networkidle", { timeout: timeoutMs });
  } catch (error) {
    if (!(error instanceof errors.TimeoutError)) {
      throw error;
    }
  }
};

export const loadPage = async (
  page: Page,
  url: string,
  timeouts: LoadTimeouts = DEFAULT_LOAD_TIMEOUTS,
): Promise<LoadedPage | LoadRejection> => {
  const outcome = await navigate(page, url, timeouts.loadMs);
  if (outcome.kind !== "html") {
    return outcome;
  }
  await settle(page, timeouts.settleMs);
  return { kind: "loaded", finalUrl: page.url() };
};

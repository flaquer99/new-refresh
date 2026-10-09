import type { GuardedFetch } from "../network/guarded-fetch.js";
import { normalizeUrl } from "./normalize-url.js";
import { parseRobots } from "./parse-robots.js";
import { fetchRobotsText, type RobotsLogger } from "./robots-text.js";

export const ROBOTS_USER_AGENT = "RefreshA11yScanner";
const ROBOTS_PATH = "/robots.txt";
const ALLOW_ALL = "";

export type RobotsPolicy = { isAllowed: (url: string) => boolean };

export type LoadRobotsPolicyInput = {
  startUrl: string;
  fetch: GuardedFetch;
  logger: RobotsLogger;
};

export const loadRobotsPolicy = async ({
  startUrl,
  fetch,
  logger,
}: LoadRobotsPolicyInput): Promise<RobotsPolicy> => {
  const start = normalizeUrl(startUrl);
  const robotsUrl = new URL(ROBOTS_PATH, start).href;
  const text = await fetchRobotsText({ robotsUrl, fetch, logger });
  const robots = parseRobots(robotsUrl, text ?? ALLOW_ALL);
  return {
    isAllowed: (url) =>
      normalizeUrl(url) === start ||
      robots.isAllowed(url, ROBOTS_USER_AGENT) !== false,
  };
};

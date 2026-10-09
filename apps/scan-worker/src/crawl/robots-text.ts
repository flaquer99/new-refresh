import type { GuardedFetch } from "../network/guarded-fetch.js";
import { readCappedText } from "./read-capped-text.js";

export const ROBOTS_FETCH_TIMEOUT_MS = 5000;
const BYTES_PER_KB = 1024;
export const ROBOTS_MAX_BYTES = 500 * BYTES_PER_KB;
const HTTP_CLIENT_ERROR_MIN = 400;
const HTTP_SERVER_ERROR_MIN = 500;

export type RobotsUnavailableLog = {
  event: "robots.unavailable";
  origin: string;
  status: number | null;
};

export type RobotsLogger = {
  warn: (details: RobotsUnavailableLog, message: string) => void;
};

export type FetchRobotsTextInput = {
  robotsUrl: string;
  fetch: GuardedFetch;
  logger: RobotsLogger;
};

const warnUnavailable = (
  { robotsUrl, logger }: FetchRobotsTextInput,
  status: number | null,
) => {
  const { origin } = new URL(robotsUrl);
  logger.warn(
    { event: "robots.unavailable", origin, status },
    "robots.unavailable",
  );
};

const requestRobots = async (
  input: FetchRobotsTextInput,
  signal: AbortSignal,
): Promise<string | null> => {
  const response = await input.fetch(input.robotsUrl, { signal });
  if (response.status >= HTTP_SERVER_ERROR_MIN) {
    warnUnavailable(input, response.status);
  }
  if (response.status >= HTTP_CLIENT_ERROR_MIN) {
    return null;
  }
  return readCappedText(response, ROBOTS_MAX_BYTES);
};

export const fetchRobotsText = async (
  input: FetchRobotsTextInput,
): Promise<string | null> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ROBOTS_FETCH_TIMEOUT_MS);
  try {
    return await requestRobots(input, controller.signal);
  } catch {
    warnUnavailable(input, null);
    return null;
  } finally {
    clearTimeout(timer);
  }
};

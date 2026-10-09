import { Response } from "undici";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GuardedFetch } from "../network/guarded-fetch.js";
import { createRecordingLogger } from "../testing/recording-logger.js";
import { loadRobotsPolicy } from "./robots-policy.js";
import { ROBOTS_FETCH_TIMEOUT_MS, ROBOTS_MAX_BYTES } from "./robots-text.js";

const START_URL = "https://a.test/";
const PRIVATE_URL = "https://a.test/private/x";
const DISALLOW_ALL = "User-agent: *\nDisallow: /";

const respond = (status: number, body = DISALLOW_ALL): GuardedFetch =>
  vi.fn(() => Promise.resolve(new Response(body, { status })));

const hangUntilAborted: GuardedFetch = (_url, init) =>
  new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
  });

const load = (fetch: GuardedFetch, logger = createRecordingLogger()) =>
  loadRobotsPolicy({ startUrl: START_URL, fetch, logger });

describe("RobotsPolicy fallbacks", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows everything when robots.txt cannot be fetched", async () => {
    // GIVEN
    const fetch = vi.fn(() => Promise.reject(new TypeError("fetch failed")));

    // WHEN
    const policy = await load(fetch);

    // THEN
    expect(policy.isAllowed(PRIVATE_URL)).toBe(true);
  });

  it("allows everything when robots.txt is missing", async () => {
    // WHEN
    const policy = await load(respond(404));

    // THEN
    expect(policy.isAllowed(PRIVATE_URL)).toBe(true);
  });

  it("allows everything when the server answers with a 5xx", async () => {
    // WHEN
    const policy = await load(respond(503));

    // THEN
    expect(policy.isAllowed(PRIVATE_URL)).toBe(true);
  });

  it("gives up and allows everything after the 5 s timeout", async () => {
    // GIVEN
    vi.useFakeTimers();
    const loading = load(hangUntilAborted);

    // WHEN
    await vi.advanceTimersByTimeAsync(ROBOTS_FETCH_TIMEOUT_MS);

    // THEN
    const policy = await loading;
    expect(policy.isAllowed(PRIVATE_URL)).toBe(true);
  });

  it("ignores rules past the 500 KB cap", async () => {
    // GIVEN
    const padding = `#${"x".repeat(ROBOTS_MAX_BYTES)}\n`;
    const body = `User-agent: *\n${padding}Disallow: /private`;

    // WHEN
    const policy = await load(respond(200, body));

    // THEN
    expect(policy.isAllowed(PRIVATE_URL)).toBe(true);
  });
});

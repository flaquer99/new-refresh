import { Response } from "undici";
import { describe, expect, it, vi } from "vitest";
import { createRecordingLogger } from "../testing/recording-logger.js";
import { loadRobotsPolicy } from "./robots-policy.js";

const START_URL = "https://a.test/";
const HTTP_OK = 200;

const robotsFetch = (body: string, status = HTTP_OK) =>
  vi.fn(() => Promise.resolve(new Response(body, { status })));

const loadWith = (fetch: ReturnType<typeof robotsFetch>) =>
  loadRobotsPolicy({
    startUrl: START_URL,
    fetch,
    logger: createRecordingLogger(),
  });

describe("RobotsPolicy rules", () => {
  it("disallows a discovered URL under a disallowed path", async () => {
    // GIVEN
    const fetch = robotsFetch("User-agent: *\nDisallow: /private");

    // WHEN
    const policy = await loadWith(fetch);

    // THEN
    expect(policy.isAllowed("https://a.test/private/x")).toBe(false);
  });

  it("allows a discovered URL outside the disallowed paths", async () => {
    // GIVEN
    const fetch = robotsFetch("User-agent: *\nDisallow: /private");

    // WHEN
    const policy = await loadWith(fetch);

    // THEN
    expect(policy.isAllowed("https://a.test/about")).toBe(true);
  });

  it("always allows the start URL, even under Disallow: /", async () => {
    // GIVEN
    const fetch = robotsFetch("User-agent: *\nDisallow: /");

    // WHEN
    const policy = await loadWith(fetch);

    // THEN
    expect(policy.isAllowed(`${START_URL}#top`)).toBe(true);
  });

  it("applies the group for the RefreshA11yScanner user agent", async () => {
    // GIVEN
    const fetch = robotsFetch(
      "User-agent: RefreshA11yScanner\nDisallow: /drafts\n\nUser-agent: *\nDisallow:",
    );

    // WHEN
    const policy = await loadWith(fetch);

    // THEN
    expect(policy.isAllowed("https://a.test/drafts/1")).toBe(false);
  });

  it("fetches robots.txt from the start page's origin", async () => {
    // GIVEN
    const fetch = robotsFetch("");

    // WHEN
    await loadWith(fetch);

    // THEN
    expect(fetch).toHaveBeenCalledWith("https://a.test/robots.txt", {
      signal: expect.any(AbortSignal),
    });
  });
});

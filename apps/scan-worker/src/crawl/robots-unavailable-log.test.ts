import { Response } from "undici";
import { describe, expect, it, vi } from "vitest";
import { createRecordingLogger } from "../testing/recording-logger.js";
import { loadRobotsPolicy } from "./robots-policy.js";

const START_URL = "https://a.test/";

describe("RobotsPolicy unavailable log", () => {
  it("logs robots.unavailable with the origin and status on a 5xx", async () => {
    // GIVEN
    const logger = createRecordingLogger();
    const fetch = vi.fn(() =>
      Promise.resolve(new Response("", { status: 503 })),
    );

    // WHEN
    await loadRobotsPolicy({ startUrl: START_URL, fetch, logger });

    // THEN
    expect(logger.warn).toHaveBeenCalledWith(
      { event: "robots.unavailable", origin: "https://a.test", status: 503 },
      "robots.unavailable",
    );
  });

  it("logs robots.unavailable without a status when the fetch fails", async () => {
    // GIVEN
    const logger = createRecordingLogger();
    const fetch = vi.fn(() => Promise.reject(new TypeError("fetch failed")));

    // WHEN
    await loadRobotsPolicy({ startUrl: START_URL, fetch, logger });

    // THEN
    expect(logger.warn).toHaveBeenCalledWith(
      { event: "robots.unavailable", origin: "https://a.test", status: null },
      "robots.unavailable",
    );
  });
});

import { describe, expect, it, vi } from "vitest";
import {
  postScan,
  scanRequest,
  startTestServer,
  useServerTestClock,
} from "../../testing/server-harness.js";

const UNWATCHED_MS = 5 * 60_000;

describe("GET /scans/:id polling", () => {
  useServerTestClock();

  it("disables caching of the status", async () => {
    // GIVEN
    const { app } = startTestServer();
    await postScan(app);

    // WHEN
    const response = await scanRequest(app, "GET");

    // THEN
    expect(response.headers["cache-control"]).toBe("no-store");
  });

  it("keeps a scan running when nobody polls it", async () => {
    // GIVEN
    const { app, controlled } = startTestServer();
    await postScan(app);

    // WHEN
    await vi.advanceTimersByTimeAsync(UNWATCHED_MS);

    // THEN
    expect(controlled.latest().input.signal.aborted).toBe(false);
  });
});

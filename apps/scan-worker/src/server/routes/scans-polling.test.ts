import { describe, expect, it, vi } from "vitest";
import {
  postScan,
  scanRequest,
  startTestServer,
  useServerTestClock,
} from "../../testing/server-harness.js";

const ABANDON_TIMEOUT_MS = 60_000;
const ALMOST_ABANDONED_MS = 59_000;

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

  it("refreshes the last poll so a watched scan is not abandoned", async () => {
    // GIVEN
    const { app, controlled } = startTestServer();
    await postScan(app);
    await vi.advanceTimersByTimeAsync(ALMOST_ABANDONED_MS);

    // WHEN
    await scanRequest(app, "GET");
    await vi.advanceTimersByTimeAsync(ABANDON_TIMEOUT_MS - 1);

    // THEN
    expect(controlled.latest().input.signal.aborted).toBe(false);
  });

  it("abandons a scan that nobody polls for 60 seconds", async () => {
    // GIVEN
    const { app, controlled } = startTestServer();
    await postScan(app);

    // WHEN
    await vi.advanceTimersByTimeAsync(ABANDON_TIMEOUT_MS);

    // THEN
    expect(controlled.latest().input.signal.aborted).toBe(true);
  });
});

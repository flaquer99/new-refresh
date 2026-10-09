import { describe, expect, it, vi } from "vitest";
import { sampleReport } from "../../testing/registry-harness.js";
import {
  postScan,
  SERVER_SCAN_ID,
  scanRequest,
  startTestServer,
  useServerTestClock,
} from "../../testing/server-harness.js";

const HTTP_ACCEPTED = 202;

describe("DELETE /scans/:id", () => {
  useServerTestClock();

  it("accepts the cancel of a running scan with 202", async () => {
    // GIVEN
    const { app } = startTestServer();
    await postScan(app);

    // WHEN
    const response = await scanRequest(app, "DELETE");

    // THEN
    expect(response.statusCode).toBe(HTTP_ACCEPTED);
    expect(response.json()).toMatchObject({
      scanId: SERVER_SCAN_ID,
      status: "running",
    });
  });

  it("aborts the runner", async () => {
    // GIVEN
    const { app, controlled } = startTestServer();
    await postScan(app);

    // WHEN
    await scanRequest(app, "DELETE");

    // THEN
    expect(controlled.latest().input.signal.aborted).toBe(true);
  });

  it("becomes cancelled with the partial report", async () => {
    // GIVEN
    const { app, controlled } = startTestServer();
    await postScan(app);
    await scanRequest(app, "DELETE");
    const partial = sampleReport("cancelled");

    // WHEN
    controlled.latest().finish(partial);
    await vi.advanceTimersByTimeAsync(0);
    const response = await scanRequest(app, "GET");

    // THEN
    expect(response.json()).toMatchObject({
      status: "cancelled",
      report: partial,
    });
  });
});

import { describe, expect, it, vi } from "vitest";
import { sampleReport } from "../../testing/registry-harness.js";
import {
  postScan,
  scanRequest,
  startTestServer,
  useServerTestClock,
} from "../../testing/server-harness.js";

const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;

describe("DELETE /scans/:id idempotency", () => {
  useServerTestClock();

  it("answers 200 with the terminal status when cancelled again", async () => {
    // GIVEN
    const { app, controlled } = startTestServer();
    await postScan(app);
    await scanRequest(app, "DELETE");
    controlled.latest().finish(sampleReport("cancelled"));
    await vi.advanceTimersByTimeAsync(0);

    // WHEN
    const second = await scanRequest(app, "DELETE");

    // THEN
    expect(second.statusCode).toBe(HTTP_OK);
    expect(second.json().status).toBe("cancelled");
  });

  it("answers 200 without changing a scan that already completed", async () => {
    // GIVEN
    const { app, controlled } = startTestServer();
    await postScan(app);
    controlled.latest().finish(sampleReport());
    await vi.advanceTimersByTimeAsync(0);

    // WHEN
    const response = await scanRequest(app, "DELETE");

    // THEN
    expect(response.statusCode).toBe(HTTP_OK);
    expect(response.json().status).toBe("completed");
  });

  it("answers 404 SCAN_NOT_FOUND for an unknown id", async () => {
    // GIVEN
    const { app } = startTestServer();

    // WHEN
    const response = await scanRequest(app, "DELETE", "missing");

    // THEN
    expect(response.statusCode).toBe(HTTP_NOT_FOUND);
    expect(response.json().error.code).toBe("SCAN_NOT_FOUND");
  });
});

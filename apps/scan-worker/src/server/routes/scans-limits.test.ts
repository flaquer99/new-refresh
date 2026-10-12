import { describe, expect, it } from "vitest";
import { scanIdFor } from "../../testing/scan-ids.js";
import {
  postScan,
  startTestServer,
  useServerTestClock,
} from "../../testing/server-harness.js";

const HTTP_CONFLICT = 409;
const SECOND_SCAN_ID = scanIdFor(2);
const HTTP_SERVICE_UNAVAILABLE = 503;

describe("POST /scans limits", () => {
  useServerTestClock();

  it("rejects a second scan from the same client with 409", async () => {
    // GIVEN
    const { app } = startTestServer();
    await postScan(app, "alice");

    // WHEN
    const response = await postScan(app, "alice", SECOND_SCAN_ID);

    // THEN
    expect(response.statusCode).toBe(HTTP_CONFLICT);
    expect(response.json()).toEqual({
      error: {
        code: "SCAN_ALREADY_RUNNING",
        message:
          "A scan is already running for you. Wait for it to finish or cancel it.",
      },
    });
  });

  it("rejects a scan beyond the global limit with 503", async () => {
    // GIVEN
    const { app } = startTestServer();
    await postScan(app, "alice");
    await postScan(app, "bob");

    // WHEN
    const response = await postScan(app, "carol");

    // THEN
    expect(response.statusCode).toBe(HTTP_SERVICE_UNAVAILABLE);
    expect(response.json().error.code).toBe("CAPACITY_REACHED");
  });

  it("treats a request without x-client-id as the anonymous client", async () => {
    // GIVEN
    const { app } = startTestServer();
    await postScan(app, "");

    // WHEN
    const response = await postScan(app, "anonymous");

    // THEN
    expect(response.statusCode).toBe(HTTP_CONFLICT);
  });
});

import { describe, expect, it } from "vitest";
import {
  AUTH_HEADERS,
  PUBLIC_URL,
  postScan,
  SERVER_SCAN_ID,
  startTestServer,
  useServerTestClock,
} from "../../testing/server-harness.js";

const HTTP_BAD_REQUEST = 400;
const HTTP_CONFLICT = 409;

describe("POST /scans scan id", () => {
  useServerTestClock();

  it("runs the scan under the id sent by web", async () => {
    // GIVEN
    const { app, controlled } = startTestServer();

    // WHEN
    await postScan(app);

    // THEN
    expect(controlled.latest().input.scanId).toBe(SERVER_SCAN_ID);
  });

  it("rejects a request without a scan id", async () => {
    // GIVEN
    const { app } = startTestServer();

    // WHEN
    const response = await app.inject({
      method: "POST",
      url: "/scans",
      headers: AUTH_HEADERS,
      payload: { url: PUBLIC_URL, depth: 0 },
    });

    // THEN
    expect(response.statusCode).toBe(HTTP_BAD_REQUEST);
  });

  it("rejects a scan id that is already in use with 409 SCAN_ID_TAKEN", async () => {
    // GIVEN
    const { app } = startTestServer();
    await postScan(app, "alice");

    // WHEN
    const response = await postScan(app, "bob", SERVER_SCAN_ID);

    // THEN
    expect([response.statusCode, response.json().error.code]).toEqual([
      HTTP_CONFLICT,
      "SCAN_ID_TAKEN",
    ]);
  });
});

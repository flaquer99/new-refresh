import { describe, expect, it } from "vitest";
import {
  AUTH_HEADERS,
  SERVER_SCAN_ID,
  startTestServer,
  useServerTestClock,
} from "../../testing/server-harness.js";

const HTTP_UNPROCESSABLE = 422;

describe("POST /scans target policy", () => {
  useServerTestClock();

  it("refuses a target on a private address before reserving a slot", async () => {
    // GIVEN
    const { app, controlled } = startTestServer();

    // WHEN
    const response = await app.inject({
      method: "POST",
      url: "/scans",
      headers: AUTH_HEADERS,
      payload: { scanId: SERVER_SCAN_ID, url: "http://127.0.0.1/", depth: 0 },
    });

    // THEN
    expect(response.statusCode).toBe(HTTP_UNPROCESSABLE);
    expect(response.json().error.code).toBe("URL_NOT_ALLOWED");
    expect(controlled.scans).toHaveLength(0);
  });
});
